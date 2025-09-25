import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord, Prisma } from '@prisma/client';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    try {
      // Verify that the patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: createMedicalRecordDto.patientId },
      });
      if (!patient) {
        throw new BadRequestException('Patient not found');
      }

      // Verify that the doctor exists
      const doctor = await this.prisma.doctor.findUnique({
        where: { id: createMedicalRecordDto.doctorId },
      });
      if (!doctor) {
        throw new BadRequestException('Doctor not found');
      }

      // If appointmentId is provided, verify it exists
      if (createMedicalRecordDto.appointmentId) {
        const appointment = await this.prisma.appointment.findUnique({
          where: { id: createMedicalRecordDto.appointmentId },
        });
        if (!appointment) {
          throw new BadRequestException('Appointment not found');
        }
      }

      const medicalRecord = await this.prisma.medicalRecord.create({
        data: createMedicalRecordDto,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            },
          },
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              appointmentTime: true,
              type: true,
            },
          },
        },
      });

      return medicalRecord;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create medical record');
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    patientId?: string,
    doctorId?: string,
    recordType?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MedicalRecordWhereInput = {
      isActive: true,
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(recordType && { recordType: recordType as any }),
    };

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            },
          },
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              appointmentTime: true,
              type: true,
            },
          },
          diagnoses: true,
          vitalSigns: true,
          prescriptions: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id, isActive: true },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            bloodGroup: true,
          },
        },
        doctor: {
          select: {
            id: true,
            doctorId: true,
            name: true,
            specialization: true,
            phone: true,
            email: true,
          },
        },
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
            type: true,
            status: true,
          },
        },
        diagnoses: {
          include: {
            treatments: true,
          },
        },
        vitalSigns: {
          orderBy: {
            measuredAt: 'desc',
          },
        },
        prescriptions: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                category: true,
                manufacturer: true,
                dosageInfo: true,
                sideEffects: true,
              },
            },
          },
        },
        documents: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    return medicalRecord;
  }

  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    try {
      // Check if the medical record exists
      const existingRecord = await this.prisma.medicalRecord.findUnique({
        where: { id, isActive: true },
      });

      if (!existingRecord) {
        throw new NotFoundException('Medical record not found');
      }

      // If updating patientId, verify the patient exists
      if (updateMedicalRecordDto.patientId) {
        const patient = await this.prisma.patient.findUnique({
          where: { id: updateMedicalRecordDto.patientId },
        });
        if (!patient) {
          throw new BadRequestException('Patient not found');
        }
      }

      // If updating doctorId, verify the doctor exists
      if (updateMedicalRecordDto.doctorId) {
        const doctor = await this.prisma.doctor.findUnique({
          where: { id: updateMedicalRecordDto.doctorId },
        });
        if (!doctor) {
          throw new BadRequestException('Doctor not found');
        }
      }

      const updatedRecord = await this.prisma.medicalRecord.update({
        where: { id },
        data: updateMedicalRecordDto,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            },
          },
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              appointmentTime: true,
              type: true,
            },
          },
        },
      });

      return updatedRecord;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update medical record');
    }
  }

  async remove(id: string): Promise<void> {
    const existingRecord = await this.prisma.medicalRecord.findUnique({
      where: { id, isActive: true },
    });

    if (!existingRecord) {
      throw new NotFoundException('Medical record not found');
    }

    // Soft delete by setting isActive to false
    await this.prisma.medicalRecord.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getPatientMedicalHistory(patientId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where: {
          patientId,
          isActive: true,
        },
        include: {
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              appointmentTime: true,
              type: true,
            },
          },
          diagnoses: true,
          vitalSigns: true,
          prescriptions: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.medicalRecord.count({
        where: {
          patientId,
          isActive: true,
        },
      }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}