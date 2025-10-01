import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/database.service';
import { CreateDoctorDto, UpdateDoctorDto, DoctorQueryDto } from './dto';
import { Doctor, Prisma } from '@prisma/client';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Check if email or license number already exists
    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        OR: [
          { email: createDoctorDto.email },
          { licenseNumber: createDoctorDto.licenseNumber }
        ]
      }
    });

    if (existingDoctor) {
      if (existingDoctor.email === createDoctorDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingDoctor.licenseNumber === createDoctorDto.licenseNumber) {
        throw new ConflictException('License number already exists');
      }
    }

    // Generate doctor ID
    const doctorId = await this.generateDoctorId();

    return this.prisma.doctor.create({
      data: {
        ...createDoctorDto,
        doctorId,
        consultationFee: createDoctorDto.consultationFee
          ? new Prisma.Decimal(createDoctorDto.consultationFee)
          : new Prisma.Decimal(0)
      }
    });
  }

  async findAll(query: DoctorQueryDto) {
    const { search, specialization, status, page, limit, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { doctorId: { contains: search } },
          { email: { contains: search } }
        ]
      }),
      ...(specialization && { specialization }),
      // Only show active doctors by default, unless status is explicitly specified
      status: status || 'active'
    };

    const orderBy: Prisma.DoctorOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    const [doctors, total] = await Promise.all([
      this.prisma.doctor.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              appointments: true,
              admissions: true
            }
          }
        }
      }),
      this.prisma.doctor.count({ where })
    ]);

    return {
      data: doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          take: 5,
          orderBy: { appointmentDate: 'desc' },
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
                patientId: true
              }
            }
          }
        },
        _count: {
          select: {
            appointments: true,
            admissions: true
          }
        }
      }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async findByDoctorId(doctorId: string): Promise<Doctor> {
    const doctor = await this.prisma.doctor.findUnique({
      where: { doctorId }
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    // Check if doctor exists
    await this.findOne(id);

    // Check for conflicts if email or license number is being updated
    if (updateDoctorDto.email || updateDoctorDto.licenseNumber) {
      const conflictWhere: Prisma.DoctorWhereInput = {
        id: { not: id },
        OR: []
      };

      if (updateDoctorDto.email) {
        conflictWhere.OR.push({ email: updateDoctorDto.email });
      }
      if (updateDoctorDto.licenseNumber) {
        conflictWhere.OR.push({ licenseNumber: updateDoctorDto.licenseNumber });
      }

      const existingDoctor = await this.prisma.doctor.findFirst({
        where: conflictWhere
      });

      if (existingDoctor) {
        if (existingDoctor.email === updateDoctorDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingDoctor.licenseNumber === updateDoctorDto.licenseNumber) {
          throw new ConflictException('License number already exists');
        }
      }
    }

    const updateData: any = { ...updateDoctorDto };
    if (updateDoctorDto.consultationFee) {
      updateData.consultationFee = new Prisma.Decimal(updateDoctorDto.consultationFee);
    }

    return this.prisma.doctor.update({
      where: { id },
      data: updateData
    });
  }

  async remove(id: string): Promise<Doctor> {
    // Check if doctor exists
    await this.findOne(id);

    // Check for any related records
    const [appointments, admissions, medicalRecords] = await Promise.all([
      this.prisma.appointment.count({ where: { doctorId: id } }),
      this.prisma.admission.count({ where: { doctorId: id } }),
      this.prisma.medicalRecord.count({ where: { doctorId: id } }),
    ]);

    // If doctor has ANY related records, use soft delete instead
    if (appointments > 0 || admissions > 0 || medicalRecords > 0) {
      return this.prisma.doctor.update({
        where: { id },
        data: { status: 'inactive' }
      });
    }

    // Only hard delete if no related records exist
    return this.prisma.doctor.delete({
      where: { id }
    });
  }

  async getStatistics() {
    const [total, active, specializations] = await Promise.all([
      this.prisma.doctor.count(),
      this.prisma.doctor.count({
        where: { status: 'active' }
      }),
      this.prisma.doctor.groupBy({
        by: ['specialization'],
        _count: {
          specialization: true
        }
      })
    ]);

    return {
      total,
      active,
      inactive: total - active,
      specializations: specializations.map(spec => ({
        specialization: spec.specialization,
        count: spec._count.specialization
      }))
    };
  }

  private async generateDoctorId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `DOC${currentYear}`;

    const lastDoctor = await this.prisma.doctor.findFirst({
      where: {
        doctorId: {
          startsWith: prefix
        }
      },
      orderBy: {
        doctorId: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastDoctor) {
      const lastNumber = parseInt(lastDoctor.doctorId.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}