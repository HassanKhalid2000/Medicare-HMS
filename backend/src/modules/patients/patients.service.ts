import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/database.service';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    try {
      // Generate patient ID
      const lastPatient = await this.prisma.patient.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { patientId: true }
      });

      let patientNumber = 1;
      if (lastPatient && lastPatient.patientId) {
        const lastNumber = parseInt(lastPatient.patientId.replace('PAT', ''));
        patientNumber = lastNumber + 1;
      }

      const patientId = `PAT${patientNumber.toString().padStart(3, '0')}`;

      const patient = await this.prisma.patient.create({
        data: {
          ...createPatientDto,
          dateOfBirth: new Date(createPatientDto.dateOfBirth),
          patientId,
        },
      });

      return {
        success: true,
        message: 'Patient created successfully',
        data: patient,
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async findAll(query: PatientQueryDto) {
    try {
      const {
        search,
        status,
        gender,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { patientId: { contains: search } },
          { phone: { contains: search } },
        ];
      }

      // Only show active patients by default, unless status is explicitly specified
      where.status = status || 'active';

      if (gender) {
        where.gender = gender;
      }

      const [patients, total] = await Promise.all([
        this.prisma.patient.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            address: true,
            emergencyContact: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        this.prisma.patient.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: patients,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        select: {
          id: true,
          patientId: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          address: true,
          emergencyContact: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      return {
        success: true,
        data: patient,
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    try {
      // Check if patient exists
      const existingPatient = await this.prisma.patient.findUnique({
        where: { id },
      });

      if (!existingPatient) {
        throw new NotFoundException('Patient not found');
      }

      const updateData = { ...updatePatientDto };
      if (updateData.dateOfBirth) {
        // Convert string date to Date object for Prisma
        (updateData as any).dateOfBirth = new Date(updateData.dateOfBirth);
      }

      const patient = await this.prisma.patient.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          patientId: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
          address: true,
          emergencyContact: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        message: 'Patient updated successfully',
        data: patient,
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      // Check if patient exists
      const existingPatient = await this.prisma.patient.findUnique({
        where: { id },
      });

      if (!existingPatient) {
        throw new NotFoundException('Patient not found');
      }

      // Check if patient has any appointments
      const appointmentCount = await this.prisma.appointment.count({
        where: { patientId: id },
      });

      if (appointmentCount > 0) {
        // Soft delete - change status to inactive
        await this.prisma.patient.update({
          where: { id },
          data: { status: 'inactive' },
        });

        return {
          success: true,
          message: 'Patient deactivated successfully (has appointments)',
        };
      } else {
        // Hard delete if no appointments
        await this.prisma.patient.delete({
          where: { id },
        });

        return {
          success: true,
          message: 'Patient deleted successfully',
        };
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async getAppointments(id: string) {
    try {
      // Check if patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const appointments = await this.prisma.appointment.findMany({
        where: { patientId: id },
        include: {
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
            },
          },
        },
        orderBy: { appointmentDate: 'desc' },
      });

      return {
        success: true,
        data: appointments,
      };
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      const total = await this.prisma.patient.count();
      const active = await this.prisma.patient.count({
        where: { status: 'active' }
      });

      const byGenderData = await this.prisma.patient.groupBy({
        by: ['gender'],
        _count: { gender: true },
      });

      const byGender = byGenderData.reduce((acc, item) => {
        acc[item.gender] = item._count.gender;
        return acc;
      }, {} as Record<string, number>);

      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const newThisMonth = await this.prisma.patient.count({
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
      });

      return {
        total,
        active,
        byGender,
        newThisMonth,
      };
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      return {
        total: 0,
        active: 0,
        byGender: {},
        newThisMonth: 0,
      };
    }
  }
}