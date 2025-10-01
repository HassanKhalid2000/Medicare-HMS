import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { AdmissionQueryDto } from './dto/admission-query.dto';
import { Admission, Prisma } from '@prisma/client';

@Injectable()
export class AdmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const { admissionDate, ...rest } = createAdmissionDto;

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createAdmissionDto.patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createAdmissionDto.doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if patient already has an active admission
    const activeAdmission = await this.prisma.admission.findFirst({
      where: {
        patientId: createAdmissionDto.patientId,
        status: 'admitted',
      },
    });

    if (activeAdmission) {
      throw new BadRequestException('Patient already has an active admission');
    }

    // Create the admission
    const admission = await this.prisma.admission.create({
      data: {
        ...rest,
        admissionDate: new Date(admissionDate),
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
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
          },
        },
      },
    });

    return admission;
  }

  async findAll(query: AdmissionQueryDto) {
    const {
      search,
      patientId,
      doctorId,
      status,
      admissionType,
      ward,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'admissionDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.AdmissionWhereInput = {};

    if (search) {
      where.OR = [
        {
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { patientId: { contains: search } },
            ],
          },
        },
        {
          doctor: {
            name: { contains: search },
          },
        },
        {
          reason: { contains: search },
        },
        {
          roomNumber: { contains: search },
        },
        {
          bedNumber: { contains: search },
        },
      ];
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    if (admissionType) {
      where.admissionType = admissionType;
    }

    if (ward) {
      where.ward = ward;
    }

    if (dateFrom || dateTo) {
      where.admissionDate = {};
      if (dateFrom) {
        where.admissionDate.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.admissionDate.lte = new Date(dateTo);
      }
    }

    // Build orderBy
    const orderBy: Prisma.AdmissionOrderByWithRelationInput = {};
    if (sortBy === 'patientName') {
      orderBy.patient = { firstName: sortOrder };
    } else if (sortBy === 'doctorName') {
      orderBy.doctor = { name: sortOrder };
    } else {
      orderBy[sortBy as keyof Admission] = sortOrder;
    }

    const [admissions, total] = await Promise.all([
      this.prisma.admission.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
              phone: true,
                bloodGroup: true,
              dateOfBirth: true,
              gender: true,
            },
          },
          doctor: {
            select: {
              id: true,
              doctorId: true,
              name: true,
              specialization: true,
              phone: true,
              },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.admission.count({ where }),
    ]);

    return {
      data: admissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Admission> {
    const admission = await this.prisma.admission.findUnique({
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
            address: true,
            emergencyContact: true,
            allergyNotes: true,
            medicalHistory: true,
          },
        },
        doctor: {
          select: {
            id: true,
            doctorId: true,
            name: true,
            specialization: true,
            phone: true,
            licenseNumber: true,
            experienceYears: true,
          },
        },
      },
    });

    if (!admission) {
      throw new NotFoundException('Admission not found');
    }

    return admission;
  }

  async update(id: string, updateAdmissionDto: UpdateAdmissionDto): Promise<Admission> {
    const admission = await this.findOne(id);

    const { admissionDate, dischargeDate, ...rest } = updateAdmissionDto;
    const updateData: any = { ...rest };

    if (admissionDate) {
      updateData.admissionDate = new Date(admissionDate);
    }

    if (dischargeDate) {
      updateData.dischargeDate = new Date(dischargeDate);
    }

    const updatedAdmission = await this.prisma.admission.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
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
          },
        },
      },
    });

    return updatedAdmission;
  }

  async discharge(id: string, dischargeSummary?: string): Promise<Admission> {
    const admission = await this.findOne(id);

    if (admission.status === 'discharged') {
      throw new BadRequestException('Patient is already discharged');
    }

    const updatedAdmission = await this.prisma.admission.update({
      where: { id },
      data: {
        status: 'discharged',
        dischargeDate: new Date(),
        dischargeSummary,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
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
          },
        },
      },
    });

    return updatedAdmission;
  }

  async remove(id: string): Promise<Admission> {
    const admission = await this.findOne(id);

    return this.prisma.admission.delete({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
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
          },
        },
      },
    });
  }

  // Get ward statistics
  async getWardStatistics() {
    const wardStats = await this.prisma.admission.groupBy({
      by: ['ward'],
      where: {
        status: 'admitted',
      },
      _count: {
        ward: true,
      },
    });

    return wardStats.map(stat => ({
      ward: stat.ward,
      count: stat._count.ward,
    }));
  }

  // Get admission statistics
  async getAdmissionStatistics() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalAdmissions,
      activeAdmissions,
      admissionsToday,
      admissionsThisMonth,
      dischargedThisMonth,
    ] = await Promise.all([
      this.prisma.admission.count(),
      this.prisma.admission.count({
        where: { status: 'admitted' },
      }),
      this.prisma.admission.count({
        where: {
          admissionDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
        },
      }),
      this.prisma.admission.count({
        where: {
          admissionDate: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      this.prisma.admission.count({
        where: {
          status: 'discharged',
          dischargeDate: {
            gte: thirtyDaysAgo,
          },
        },
      }),
    ]);

    return {
      totalAdmissions,
      activeAdmissions,
      admissionsToday,
      admissionsThisMonth,
      dischargedThisMonth,
    };
  }
}