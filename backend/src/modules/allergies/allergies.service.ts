import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';
import { AllergyQueryDto } from './dto/allergy-query.dto';

@Injectable()
export class AllergiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAllergyDto: CreateAllergyDto) {
    const { patientId, ...data } = createAllergyDto;

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    return this.prisma.allergy.create({
      data: {
        ...data,
        patient: {
          connect: { id: patientId },
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });
  }

  async findAll(query: AllergyQueryDto) {
    const {
      patientId,
      category,
      severity,
      isActive,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (category) {
      where.category = category;
    }

    if (severity) {
      where.severity = severity;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.allergen = {
        contains: search,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.allergy.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientId: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.allergy.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const allergy = await this.prisma.allergy.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!allergy) {
      throw new NotFoundException(`Allergy with ID ${id} not found`);
    }

    return allergy;
  }

  async findByPatient(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    return this.prisma.allergy.findMany({
      where: {
        patientId,
        isActive: true,
      },
      orderBy: {
        severity: 'desc',
      },
    });
  }

  async update(id: string, updateAllergyDto: UpdateAllergyDto) {
    const allergy = await this.prisma.allergy.findUnique({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Allergy with ID ${id} not found`);
    }

    return this.prisma.allergy.update({
      where: { id },
      data: updateAllergyDto,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const allergy = await this.prisma.allergy.findUnique({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Allergy with ID ${id} not found`);
    }

    return this.prisma.allergy.delete({
      where: { id },
    });
  }

  async deactivate(id: string) {
    const allergy = await this.prisma.allergy.findUnique({
      where: { id },
    });

    if (!allergy) {
      throw new NotFoundException(`Allergy with ID ${id} not found`);
    }

    return this.prisma.allergy.update({
      where: { id },
      data: { isActive: false },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });
  }

  async checkDrugAllergy(patientId: string, drugName: string) {
    const allergies = await this.prisma.allergy.findMany({
      where: {
        patientId,
        isActive: true,
        category: {
          in: ['Medication', 'Drug', 'Pharmaceutical'],
        },
      },
    });

    const matchingAllergies = allergies.filter((allergy) =>
      allergy.allergen.toLowerCase().includes(drugName.toLowerCase()) ||
      drugName.toLowerCase().includes(allergy.allergen.toLowerCase())
    );

    return {
      hasAllergy: matchingAllergies.length > 0,
      allergies: matchingAllergies,
    };
  }
}
