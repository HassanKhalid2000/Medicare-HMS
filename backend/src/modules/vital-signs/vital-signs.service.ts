import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VitalSign, VitalSignType, Prisma } from '@prisma/client';
import { CreateVitalSignDto, UpdateVitalSignDto } from './dto';

@Injectable()
export class VitalSignsService {
  constructor(private prisma: PrismaService) {}

  async create(createVitalSignDto: CreateVitalSignDto): Promise<VitalSign> {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createVitalSignDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // If medical record ID is provided, verify it exists and belongs to the patient
    if (createVitalSignDto.medicalRecordId) {
      const medicalRecord = await this.prisma.medicalRecord.findFirst({
        where: {
          id: createVitalSignDto.medicalRecordId,
          patientId: createVitalSignDto.patientId,
        },
      });

      if (!medicalRecord) {
        throw new NotFoundException('Medical record not found or does not belong to the patient');
      }
    }

    // Parse and validate measurement date
    const measuredAt = createVitalSignDto.measuredAt
      ? new Date(createVitalSignDto.measuredAt)
      : new Date();

    // Check for abnormal values based on type and value
    const isAbnormal = createVitalSignDto.isAbnormal ??
      this.checkIfAbnormal(createVitalSignDto.type, createVitalSignDto.value);

    return this.prisma.vitalSign.create({
      data: {
        patientId: createVitalSignDto.patientId,
        medicalRecordId: createVitalSignDto.medicalRecordId,
        type: createVitalSignDto.type,
        value: createVitalSignDto.value,
        unit: createVitalSignDto.unit,
        normalRange: createVitalSignDto.normalRange || this.getNormalRange(createVitalSignDto.type),
        isAbnormal,
        notes: createVitalSignDto.notes,
        measuredBy: createVitalSignDto.measuredBy,
        measuredAt,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          },
        },
      },
    });
  }

  async findAll(patientId?: string, type?: VitalSignType, limit?: number) {
    const where: Prisma.VitalSignWhereInput = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (type) {
      where.type = type;
    }

    return this.prisma.vitalSign.findMany({
      where,
      take: limit,
      orderBy: { measuredAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<VitalSign> {
    const vitalSign = await this.prisma.vitalSign.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          },
        },
      },
    });

    if (!vitalSign) {
      throw new NotFoundException('Vital sign not found');
    }

    return vitalSign;
  }

  async update(id: string, updateVitalSignDto: UpdateVitalSignDto): Promise<VitalSign> {
    const existingVitalSign = await this.findOne(id);

    // If type or value is being updated, recalculate abnormal status
    let isAbnormal = existingVitalSign.isAbnormal;
    if (updateVitalSignDto.type || updateVitalSignDto.value) {
      const type = updateVitalSignDto.type || existingVitalSign.type;
      const value = updateVitalSignDto.value || existingVitalSign.value;
      isAbnormal = updateVitalSignDto.isAbnormal ?? this.checkIfAbnormal(type, value);
    }

    const updateData: Prisma.VitalSignUpdateInput = {
      ...updateVitalSignDto,
      isAbnormal,
    };

    if (updateVitalSignDto.measuredAt) {
      updateData.measuredAt = new Date(updateVitalSignDto.measuredAt);
    }

    return this.prisma.vitalSign.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.vitalSign.delete({
      where: { id },
    });
  }

  async getPatientVitalHistory(patientId: string, type?: VitalSignType, days?: number) {
    const where: Prisma.VitalSignWhereInput = { patientId };

    if (type) {
      where.type = type;
    }

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      where.measuredAt = {
        gte: startDate,
      };
    }

    return this.prisma.vitalSign.findMany({
      where,
      orderBy: { measuredAt: 'asc' },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          },
        },
      },
    });
  }

  async getLatestVitalSigns(patientId: string) {
    const vitalTypes = Object.values(VitalSignType);
    const latestVitals = [];

    for (const type of vitalTypes) {
      const latest = await this.prisma.vitalSign.findFirst({
        where: { patientId, type },
        orderBy: { measuredAt: 'desc' },
        include: {
          medicalRecord: {
            select: {
              id: true,
              title: true,
              recordType: true,
            },
          },
        },
      });

      if (latest) {
        latestVitals.push(latest);
      }
    }

    return latestVitals;
  }

  async getVitalSignsStatistics(patientId?: string, days: number = 30) {
    const where: Prisma.VitalSignWhereInput = {};

    if (patientId) {
      where.patientId = patientId;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    where.measuredAt = { gte: startDate };

    const [total, abnormal, byType] = await Promise.all([
      this.prisma.vitalSign.count({ where }),
      this.prisma.vitalSign.count({ where: { ...where, isAbnormal: true } }),
      this.prisma.vitalSign.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      abnormal,
      normal: total - abnormal,
      abnormalPercentage: total > 0 ? Math.round((abnormal / total) * 100) : 0,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count,
      })),
    };
  }

  async getAbnormalVitalSigns(patientId?: string, limit: number = 20) {
    const where: Prisma.VitalSignWhereInput = { isAbnormal: true };

    if (patientId) {
      where.patientId = patientId;
    }

    return this.prisma.vitalSign.findMany({
      where,
      take: limit,
      orderBy: { measuredAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          },
        },
      },
    });
  }

  private checkIfAbnormal(type: VitalSignType, value: string): boolean {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return false;

    switch (type) {
      case VitalSignType.BLOOD_PRESSURE:
        // Assuming format "120/80"
        const [systolic, diastolic] = value.split('/').map(v => parseInt(v));
        return systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60;

      case VitalSignType.HEART_RATE:
        return numericValue > 100 || numericValue < 60;

      case VitalSignType.TEMPERATURE:
        return numericValue > 37.5 || numericValue < 36.0;

      case VitalSignType.RESPIRATORY_RATE:
        return numericValue > 20 || numericValue < 12;

      case VitalSignType.OXYGEN_SATURATION:
        return numericValue < 95;

      case VitalSignType.BMI:
        return numericValue > 30 || numericValue < 18.5;

      case VitalSignType.PAIN_SCALE:
        return numericValue >= 7;

      default:
        return false;
    }
  }

  private getNormalRange(type: VitalSignType): string {
    switch (type) {
      case VitalSignType.BLOOD_PRESSURE:
        return '90-140 / 60-90 mmHg';
      case VitalSignType.HEART_RATE:
        return '60-100 bpm';
      case VitalSignType.TEMPERATURE:
        return '36.0-37.5°C';
      case VitalSignType.RESPIRATORY_RATE:
        return '12-20 breaths/min';
      case VitalSignType.OXYGEN_SATURATION:
        return '95-100%';
      case VitalSignType.WEIGHT:
        return 'Variable';
      case VitalSignType.HEIGHT:
        return 'Variable';
      case VitalSignType.BMI:
        return '18.5-30 kg/m²';
      case VitalSignType.PAIN_SCALE:
        return '0-3 (mild)';
      default:
        return 'Variable';
    }
  }
}