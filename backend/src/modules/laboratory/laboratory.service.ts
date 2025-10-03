import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/database.service';
import { CreateLabTestDto, UpdateLabTestDto, LabTestQueryDto } from './dto';
import { LabTest, Prisma } from '@prisma/client';

@Injectable()
export class LaboratoryService {
  constructor(private prisma: PrismaService) {}

  async create(createLabTestDto: CreateLabTestDto): Promise<LabTest> {
    // Validate patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createLabTestDto.patientId }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate doctor exists
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: createLabTestDto.doctorId }
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Generate test number
    const testNumber = await this.generateTestNumber();

    const { panelIds, ...testData } = createLabTestDto;

    const labTest = await this.prisma.labTest.create({
      data: {
        ...testData,
        testNumber,
        cost: createLabTestDto.cost ? new Prisma.Decimal(createLabTestDto.cost) : null,
        ...(panelIds && panelIds.length > 0 && {
          labPanels: {
            create: panelIds.map(panelId => ({
              panelId
            }))
          }
        })
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true
          }
        },
        doctor: {
          select: {
            doctorId: true,
            name: true,
            specialization: true
          }
        },
        labPanels: {
          include: {
            panel: true
          }
        }
      }
    });

    return labTest;
  }

  async findAll(query: LabTestQueryDto) {
    const {
      search,
      patientId,
      doctorId,
      testType,
      status,
      urgency,
      dateFrom,
      dateTo,
      page,
      limit,
      sortBy,
      sortOrder
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.LabTestWhereInput = {
      ...(search && {
        OR: [
          { testNumber: { contains: search } },
          { patient: { firstName: { contains: search } } },
          { patient: { lastName: { contains: search } } },
        ]
      }),
      ...(patientId && { patientId }),
      ...(doctorId && { doctorId }),
      ...(testType && { testType }),
      ...(status && { status }),
      ...(urgency && { urgency }),
      ...(dateFrom && dateTo && {
        requestedAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      })
    };

    const orderBy: Prisma.LabTestOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    const [labTests, total] = await Promise.all([
      this.prisma.labTest.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              patientId: true,
              firstName: true,
              lastName: true,
              gender: true,
              dateOfBirth: true
            }
          },
          doctor: {
            select: {
              doctorId: true,
              name: true,
              specialization: true
            }
          },
          labPanels: {
            include: {
              panel: {
                select: {
                  id: true,
                  name: true,
                  category: true
                }
              }
            }
          },
          _count: {
            select: {
              labResults: true
            }
          }
        }
      }),
      this.prisma.labTest.count({ where })
    ]);

    return {
      data: labTests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string): Promise<LabTest> {
    const labTest = await this.prisma.labTest.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
            phone: true
          }
        },
        doctor: {
          select: {
            doctorId: true,
            name: true,
            specialization: true,
            email: true,
            phone: true
          }
        },
        labPanels: {
          include: {
            panel: {
              include: {
                panelTests: {
                  include: {
                    parameter: true
                  }
                }
              }
            }
          }
        },
        labResults: {
          include: {
            parameter: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!labTest) {
      throw new NotFoundException('Lab test not found');
    }

    return labTest;
  }

  async update(id: string, updateLabTestDto: UpdateLabTestDto): Promise<LabTest> {
    await this.findOne(id);

    const labTest = await this.prisma.labTest.update({
      where: { id },
      data: {
        ...updateLabTestDto,
        ...(updateLabTestDto.cost && { cost: new Prisma.Decimal(updateLabTestDto.cost) })
      },
      include: {
        patient: {
          select: {
            patientId: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true
          }
        },
        doctor: {
          select: {
            doctorId: true,
            name: true,
            specialization: true
          }
        },
        labPanels: {
          include: {
            panel: true
          }
        },
        labResults: {
          include: {
            parameter: true
          }
        }
      }
    });

    return labTest;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.labTest.delete({
      where: { id }
    });
  }

  async getStatistics() {
    const [
      total,
      requested,
      processing,
      completed,
      statusCounts,
      typeCounts
    ] = await Promise.all([
      this.prisma.labTest.count(),
      this.prisma.labTest.count({
        where: { status: 'requested' }
      }),
      this.prisma.labTest.count({
        where: { status: 'processing' }
      }),
      this.prisma.labTest.count({
        where: { status: 'completed' }
      }),
      this.prisma.labTest.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      this.prisma.labTest.groupBy({
        by: ['testType'],
        _count: {
          testType: true
        }
      })
    ]);

    return {
      total,
      requested,
      processing,
      completed,
      byStatus: statusCounts.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      byType: typeCounts.map(item => ({
        type: item.testType,
        count: item._count.testType
      }))
    };
  }

  private async generateTestNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `LAB-${year}${month}`;

    const lastTest = await this.prisma.labTest.findFirst({
      where: {
        testNumber: {
          startsWith: prefix
        }
      },
      orderBy: {
        testNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastTest) {
      const lastNumber = parseInt(lastTest.testNumber.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  }
}
