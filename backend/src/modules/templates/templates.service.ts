import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CreateTemplateInstanceDto } from './dto/create-template-instance.dto';
import { UpdateTemplateInstanceDto } from './dto/update-template-instance.dto';
import { MedicalTemplate, MedicalTemplateInstance, MedicalTemplateCategory, MedicalTemplateType, TemplateInstanceStatus } from '@prisma/client';

interface TemplateFilters {
  page: number;
  limit: number;
  category?: MedicalTemplateCategory;
  templateType?: MedicalTemplateType;
  isActive?: boolean;
  search?: string;
  specialization?: string;
  createdBy?: string;
}

interface TemplateInstanceFilters {
  page: number;
  limit: number;
  patientId?: string;
  templateId?: string;
  status?: TemplateInstanceStatus;
  completedBy?: string;
}

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  // Template CRUD operations
  async create(createTemplateDto: CreateTemplateDto, userId: string): Promise<MedicalTemplate> {
    const template = await this.prisma.medicalTemplate.create({
      data: {
        ...createTemplateDto,
        createdBy: userId,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return template;
  }

  async findAll(filters: TemplateFilters) {
    const { page, limit, category, templateType, isActive, search, specialization, createdBy } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) where.category = category;
    if (templateType) where.templateType = templateType;
    if (isActive !== undefined) where.isActive = isActive;
    if (specialization) where.specialization = specialization;
    if (createdBy) where.createdBy = createdBy;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.medicalTemplate.findMany({
        where,
        include: {
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          },
          _count: {
            select: {
              templateInstances: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalTemplate.count({ where }),
    ]);

    return {
      data: templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<MedicalTemplate> {
    const template = await this.prisma.medicalTemplate.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        _count: {
          select: {
            templateInstances: true
          }
        }
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto, userId: string): Promise<MedicalTemplate> {
    const template = await this.findOne(id);

    // Check if user can update this template
    if (template.isSystem && !this.isSystemAdmin(userId)) {
      throw new ForbiddenException('Cannot modify system templates');
    }

    const updatedTemplate = await this.prisma.medicalTemplate.update({
      where: { id },
      data: updateTemplateDto,
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return updatedTemplate;
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id);

    // Check if user can delete this template
    if (template.isSystem && !this.isSystemAdmin(userId)) {
      throw new ForbiddenException('Cannot delete system templates');
    }

    // Check if template has instances
    const instanceCount = await this.prisma.medicalTemplateInstance.count({
      where: { templateId: id }
    });

    if (instanceCount > 0) {
      throw new BadRequestException('Cannot delete template with existing instances');
    }

    await this.prisma.medicalTemplate.delete({
      where: { id },
    });
  }

  // Template Instance operations
  async createInstance(createInstanceDto: CreateTemplateInstanceDto, userId: string): Promise<MedicalTemplateInstance> {
    // Verify template exists and is active
    const template = await this.findOne(createInstanceDto.templateId);
    if (!template.isActive) {
      throw new BadRequestException('Cannot create instance from inactive template');
    }

    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: createInstanceDto.patientId }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Verify medical record if provided
    if (createInstanceDto.medicalRecordId) {
      const medicalRecord = await this.prisma.medicalRecord.findUnique({
        where: { id: createInstanceDto.medicalRecordId }
      });
      if (!medicalRecord) {
        throw new NotFoundException('Medical record not found');
      }
    }

    const instance = await this.prisma.medicalTemplateInstance.create({
      data: {
        ...createInstanceDto,
        completedBy: userId,
        status: createInstanceDto.status || TemplateInstanceStatus.DRAFT,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            templateType: true,
          }
        },
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          }
        },
        completedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return instance;
  }

  async findAllInstances(filters: TemplateInstanceFilters) {
    const { page, limit, patientId, templateId, status, completedBy } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (patientId) where.patientId = patientId;
    if (templateId) where.templateId = templateId;
    if (status) where.status = status;
    if (completedBy) where.completedBy = completedBy;

    const [instances, total] = await Promise.all([
      this.prisma.medicalTemplateInstance.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true,
              templateType: true,
            }
          },
          patient: {
            select: {
              id: true,
              patientId: true,
              firstName: true,
              lastName: true,
            }
          },
          completedByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          },
          lastModifiedByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalTemplateInstance.count({ where }),
    ]);

    return {
      data: instances,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneInstance(id: string): Promise<MedicalTemplateInstance> {
    const instance = await this.prisma.medicalTemplateInstance.findUnique({
      where: { id },
      include: {
        template: true,
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          }
        },
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
          }
        },
        completedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        lastModifiedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
    });

    if (!instance) {
      throw new NotFoundException('Template instance not found');
    }

    return instance;
  }

  async updateInstance(id: string, updateInstanceDto: UpdateTemplateInstanceDto, userId: string): Promise<MedicalTemplateInstance> {
    await this.findOneInstance(id);

    const updatedInstance = await this.prisma.medicalTemplateInstance.update({
      where: { id },
      data: {
        ...updateInstanceDto,
        lastModifiedBy: userId,
        lastModifiedAt: new Date(),
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            templateType: true,
          }
        },
        patient: {
          select: {
            id: true,
            patientId: true,
            firstName: true,
            lastName: true,
          }
        },
        completedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        },
        lastModifiedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    return updatedInstance;
  }

  async removeInstance(id: string): Promise<void> {
    await this.findOneInstance(id);

    await this.prisma.medicalTemplateInstance.delete({
      where: { id },
    });
  }

  // Utility methods
  async getTemplatesByCategory(category: MedicalTemplateCategory): Promise<MedicalTemplate[]> {
    return this.prisma.medicalTemplate.findMany({
      where: {
        category,
        isActive: true,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSystemTemplates(): Promise<MedicalTemplate[]> {
    return this.prisma.medicalTemplate.findMany({
      where: {
        isSystem: true,
        isActive: true,
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  private async isSystemAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    return user?.role === 'admin';
  }
}