import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentQueryDto } from './dto';
import { Appointment, Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private convertTimeToDateTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    const timeDateTime = new Date();
    timeDateTime.setHours(hours, minutes, 0, 0);
    return timeDateTime;
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createAppointmentDto.patientId }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate doctor exists and is active
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createAppointmentDto.doctorId }
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    if (doctor.status !== 'active') {
      throw new BadRequestException('Doctor is not active');
    }

    // Check for appointment conflicts
    const appointmentDate = createAppointmentDto.appointmentDate;
    const appointmentTime = createAppointmentDto.appointmentTime;

    const duration = createAppointmentDto.duration || 30;

    // Simplified conflict detection - check for exact same doctor, date, and time
    const timeDateTime = this.convertTimeToDateTime(appointmentTime);

    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        doctorId: createAppointmentDto.doctorId,
        appointmentDate: appointmentDate,
        appointmentTime: timeDateTime,
        status: {
          in: ['scheduled', 'confirmed']
        }
      }
    });

    if (conflictingAppointment) {
      throw new ConflictException('Doctor is not available at the selected time');
    }

    // Validate appointment is not in the past
    const now = new Date();
    const appointmentDateTime = new Date(appointmentDate);

    // Parse time and combine with date
    const timeDate = this.convertTimeToDateTime(appointmentTime);
    appointmentDateTime.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);

    if (appointmentDateTime < now) {
      throw new BadRequestException('Cannot schedule appointment in the past');
    }

    return this.prisma.appointment.create({
      data: {
        ...createAppointmentDto,
        appointmentTime: timeDateTime
      } as any,
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        doctor: {
          select: {
            doctorId: true,
            name: true,
            specialization: true,
            consultationFee: true
          }
        }
      }
    });
  }

  async findAll(query: AppointmentQueryDto) {
    const {
      search,
      patientId,
      doctorId,
      type,
      status,
      dateFrom,
      dateTo,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      ...(search && {
        OR: [
          {
            patient: {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { patientId: { contains: search } }
              ]
            }
          },
          {
            doctor: {
              name: { contains: search }
            }
          }
        ]
      }),
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(dateFrom && dateTo && {
        appointmentDate: {
          gte: dateFrom,
          lte: dateTo
        }
      }),
      ...(dateFrom && !dateTo && {
        appointmentDate: { gte: dateFrom }
      }),
      ...(!dateFrom && dateTo && {
        appointmentDate: { lte: dateTo }
      })
    };

    const orderBy: Prisma.AppointmentOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
              consultationFee: true
            }
          }
        }
      }),
      this.prisma.appointment.count({ where })
    ]);

    return {
      data: appointments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            bloodGroup: true,
            allergies: true,
            medicalHistory: true
          }
        },
        doctor: {
          select: {
            id: true,
            doctorId: true,
            name: true,
            specialization: true,
            consultationFee: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    // Check if appointment exists
    const existingAppointment = await this.findOne(id);

    // If updating date/time, check for conflicts
    if (updateAppointmentDto.appointmentDate || updateAppointmentDto.appointmentTime) {
      const appointmentDate = updateAppointmentDto.appointmentDate || existingAppointment.appointmentDate;
      const appointmentTime = updateAppointmentDto.appointmentTime || existingAppointment.appointmentTime;
      const doctorId = updateAppointmentDto.doctorId || existingAppointment.doctorId;

      // Convert time string to DateTime for database query if it's a string
      let timeDateTime = appointmentTime;
      if (typeof appointmentTime === 'string') {
        timeDateTime = this.convertTimeToDateTime(appointmentTime);
      }

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId,
          appointmentDate,
          appointmentTime: timeDateTime,
          status: {
            in: ['scheduled', 'confirmed']
          }
        }
      });

      if (conflictingAppointment) {
        throw new ConflictException('Doctor is not available at the selected time');
      }
    }

    // Prepare update data with proper time conversion
    const updateData: any = { ...updateAppointmentDto };
    if (updateAppointmentDto.appointmentTime && typeof updateAppointmentDto.appointmentTime === 'string') {
      updateData.appointmentTime = this.convertTimeToDateTime(updateAppointmentDto.appointmentTime);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        doctor: {
          select: {
            doctorId: true,
            name: true,
            specialization: true,
            consultationFee: true
          }
        }
      }
    });
  }

  async remove(id: string): Promise<Appointment> {
    // Check if appointment exists
    await this.findOne(id);

    return this.prisma.appointment.delete({
      where: { id }
    });
  }

  async getAvailableTimeSlots(doctorId: string, date: string) {
    // Validate doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const appointmentDate = new Date(date);

    // Get existing appointments for the doctor on this date
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        appointmentDate,
        status: {
          in: ['scheduled', 'confirmed']
        }
      },
      select: {
        appointmentTime: true,
        duration: true
      }
    });

    // Generate available time slots (9 AM to 5 PM with 30-min intervals)
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 30; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = new Date();
        slotTime.setHours(hour, minute, 0, 0);

        const isAvailable = !existingAppointments.some(apt => {
          const aptTime = new Date(apt.appointmentTime);
          const aptEndTime = new Date(aptTime.getTime() + (apt.duration || 30) * 60000);
          const slotEndTime = new Date(slotTime.getTime() + slotDuration * 60000);

          return (
            (slotTime >= aptTime && slotTime < aptEndTime) ||
            (slotEndTime > aptTime && slotEndTime <= aptEndTime) ||
            (slotTime <= aptTime && slotEndTime >= aptEndTime)
          );
        });

        slots.push({
          time: slotTime.toTimeString().slice(0, 5), // HH:MM format
          available: isAvailable
        });
      }
    }

    return slots;
  }

  async getStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [total, todayAppointments, statusCounts, typeCounts] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      this.prisma.appointment.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      this.prisma.appointment.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      })
    ]);

    return {
      total,
      today: todayAppointments,
      byStatus: statusCounts.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      byType: typeCounts.map(item => ({
        type: item.type,
        count: item._count.type
      }))
    };
  }
}