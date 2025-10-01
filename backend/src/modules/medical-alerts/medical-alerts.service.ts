import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateMedicalAlertDto, UpdateMedicalAlertDto, MedicalAlertQueryDto } from './dto';
import { AlertSeverity, Prisma } from '@prisma/client';

@Injectable()
export class MedicalAlertsService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalAlertDto: CreateMedicalAlertDto) {
    try {
      // Verify patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: createMedicalAlertDto.patientId },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const medicalAlert = await this.prisma.medicalAlert.create({
        data: {
          ...createMedicalAlertDto,
          expiresAt: createMedicalAlertDto.expiresAt ? new Date(createMedicalAlertDto.expiresAt) : null,
        },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              phone: true,
            },
          },
        },
      });

      return medicalAlert;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create medical alert');
    }
  }

  async findAll(query: MedicalAlertQueryDto) {
    const { page = 1, limit = 10, patientId, alertType, severity, isActive, isAcknowledged, search } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: Prisma.MedicalAlertWhereInput = {};

    if (patientId) {
      whereConditions.patientId = patientId;
    }

    if (alertType) {
      whereConditions.alertType = alertType;
    }

    if (severity) {
      whereConditions.severity = severity;
    }

    if (typeof isActive === 'boolean') {
      whereConditions.isActive = isActive;
    }

    if (typeof isAcknowledged === 'boolean') {
      if (isAcknowledged) {
        whereConditions.acknowledgedAt = { not: null };
      } else {
        whereConditions.acknowledgedAt = null;
      }
    }

    if (search) {
      whereConditions.OR = [
        { title: { contains: search } },
        { message: { contains: search } },
      ];
    }

    // Get total count for pagination
    const total = await this.prisma.medicalAlert.count({
      where: whereConditions,
    });

    // Get alerts with pagination
    const alerts = await this.prisma.medicalAlert.findMany({
      where: whereConditions,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { severity: 'desc' }, // Critical first
        { triggeredAt: 'desc' }, // Most recent first
      ],
      skip,
      take: limit,
    });

    return {
      data: alerts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const alert = await this.prisma.medicalAlert.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phone: true,
            address: true,
            emergencyContact: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Medical alert not found');
    }

    return alert;
  }

  async update(id: string, updateMedicalAlertDto: UpdateMedicalAlertDto) {
    try {
      const existingAlert = await this.prisma.medicalAlert.findUnique({
        where: { id },
      });

      if (!existingAlert) {
        throw new NotFoundException('Medical alert not found');
      }

      const updatedAlert = await this.prisma.medicalAlert.update({
        where: { id },
        data: {
          ...updateMedicalAlertDto,
          expiresAt: updateMedicalAlertDto.expiresAt ? new Date(updateMedicalAlertDto.expiresAt) : undefined,
          acknowledgedAt: updateMedicalAlertDto.acknowledgedAt ? new Date(updateMedicalAlertDto.acknowledgedAt) : undefined,
        },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              phone: true,
            },
          },
        },
      });

      return updatedAlert;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update medical alert');
    }
  }

  async remove(id: string) {
    try {
      const existingAlert = await this.prisma.medicalAlert.findUnique({
        where: { id },
      });

      if (!existingAlert) {
        throw new NotFoundException('Medical alert not found');
      }

      await this.prisma.medicalAlert.delete({
        where: { id },
      });

      return { message: 'Medical alert deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete medical alert');
    }
  }

  async acknowledge(id: string, acknowledgedBy: string) {
    try {
      const existingAlert = await this.prisma.medicalAlert.findUnique({
        where: { id },
      });

      if (!existingAlert) {
        throw new NotFoundException('Medical alert not found');
      }

      if (existingAlert.acknowledgedAt) {
        throw new BadRequestException('Alert has already been acknowledged');
      }

      const updatedAlert = await this.prisma.medicalAlert.update({
        where: { id },
        data: {
          acknowledgedAt: new Date(),
          acknowledgedBy,
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
        },
      });

      return updatedAlert;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to acknowledge medical alert');
    }
  }

  async deactivate(id: string) {
    try {
      const existingAlert = await this.prisma.medicalAlert.findUnique({
        where: { id },
      });

      if (!existingAlert) {
        throw new NotFoundException('Medical alert not found');
      }

      const updatedAlert = await this.prisma.medicalAlert.update({
        where: { id },
        data: { isActive: false },
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return updatedAlert;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to deactivate medical alert');
    }
  }

  async getPatientAlerts(patientId: string) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const alerts = await this.prisma.medicalAlert.findMany({
      where: {
        patientId,
        isActive: true,
      },
      orderBy: [
        { severity: 'desc' },
        { triggeredAt: 'desc' },
      ],
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return alerts;
  }

  async getCriticalAlerts() {
    const alerts = await this.prisma.medicalAlert.findMany({
      where: {
        severity: AlertSeverity.CRITICAL,
        isActive: true,
        acknowledgedAt: null,
      },
      orderBy: { triggeredAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            emergencyContact: true,
          },
        },
      },
    });

    return alerts;
  }

  async getAlertStatistics() {
    const [
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      acknowledgedAlerts,
      alertsByType,
      alertsBySeverity,
    ] = await Promise.all([
      this.prisma.medicalAlert.count(),
      this.prisma.medicalAlert.count({ where: { isActive: true } }),
      this.prisma.medicalAlert.count({
        where: {
          severity: AlertSeverity.CRITICAL,
          isActive: true,
          acknowledgedAt: null,
        }
      }),
      this.prisma.medicalAlert.count({ where: { acknowledgedAt: { not: null } } }),
      this.prisma.medicalAlert.groupBy({
        by: ['alertType'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.medicalAlert.groupBy({
        by: ['severity'],
        _count: { id: true },
        where: { isActive: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    return {
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      acknowledgedAlerts,
      alertsByType: alertsByType.map(item => ({
        type: item.alertType,
        count: item._count.id,
      })),
      alertsBySeverity: alertsBySeverity.map(item => ({
        severity: item.severity,
        count: item._count.id,
      })),
    };
  }

  async cleanupExpiredAlerts() {
    const result = await this.prisma.medicalAlert.updateMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return { deactivatedCount: result.count };
  }

  async createMedicationReminder(patientId: string, medicationName: string, nextDoseTime: Date) {
    return this.create({
      patientId,
      alertType: 'medication_reminder',
      title: `Medication Reminder: ${medicationName}`,
      message: `It's time to take your ${medicationName} medication. Next dose scheduled for ${nextDoseTime.toLocaleString()}.`,
      severity: AlertSeverity.MEDIUM,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
    });
  }

  async createCriticalLabAlert(patientId: string, labTest: string, value: string, normalRange: string) {
    return this.create({
      patientId,
      alertType: 'lab_results_critical',
      title: `Critical Lab Result: ${labTest}`,
      message: `Critical lab value detected: ${labTest} = ${value} (Normal: ${normalRange}). Immediate medical attention may be required.`,
      severity: AlertSeverity.CRITICAL,
    });
  }

  async createVitalSignsAlert(patientId: string, vitalSign: string, value: string, normalRange: string) {
    return this.create({
      patientId,
      alertType: 'vital_signs_abnormal',
      title: `Abnormal Vital Signs: ${vitalSign}`,
      message: `Abnormal ${vitalSign} detected: ${value} (Normal: ${normalRange}). Please monitor patient closely.`,
      severity: AlertSeverity.HIGH,
    });
  }

  async createAppointmentReminder(patientId: string, appointmentDate: Date, doctorName: string) {
    return this.create({
      patientId,
      alertType: 'appointment_followup',
      title: `Upcoming Appointment Reminder`,
      message: `You have an appointment scheduled with ${doctorName} on ${appointmentDate.toLocaleDateString()} at ${appointmentDate.toLocaleTimeString()}.`,
      severity: AlertSeverity.LOW,
      expiresAt: appointmentDate.toISOString(),
    });
  }
}