import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';

@Injectable()
export class MedicalReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto, requestedBy: string) {
    const report = await this.prisma.medicalReport.create({
      data: {
        title: createReportDto.title,
        description: createReportDto.description,
        type: createReportDto.type,
        format: createReportDto.format || 'PDF',
        status: 'COMPLETED', // Mark as completed immediately since PDF is generated on frontend
        requestedBy,
        generatedBy: requestedBy,
        parameters: createReportDto.parameters || {},
        filters: createReportDto.filters || {},
        expiresAt: createReportDto.expiresAt ? new Date(createReportDto.expiresAt) : null,
        completedAt: new Date(),
      },
      include: {
        requestedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
        generatedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async findAll(query: ReportQueryDto, userId: string) {
    const {
      type,
      status,
      format,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'requestedAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (format) where.format = format;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (startDate || endDate) {
      where.requestedAt = {};
      if (startDate) where.requestedAt.gte = new Date(startDate);
      if (endDate) where.requestedAt.lte = new Date(endDate);
    }

    const [reports, total] = await Promise.all([
      this.prisma.medicalReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          requestedByUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
          generatedByUser: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.medicalReport.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const report = await this.prisma.medicalReport.findUnique({
      where: { id },
      include: {
        requestedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
        generatedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto, userId: string) {
    await this.findOne(id, userId);

    const report = await this.prisma.medicalReport.update({
      where: { id },
      data: {
        title: updateReportDto.title,
        description: updateReportDto.description,
        status: updateReportDto.status,
        filters: updateReportDto.filters,
        parameters: updateReportDto.parameters,
      },
      include: {
        requestedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
        generatedByUser: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return report;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.medicalReport.delete({
      where: { id },
    });

    return { message: 'Report deleted successfully' };
  }

  async createTemplate(createTemplateDto: CreateReportTemplateDto, userId: string) {
    return {
      id: '1',
      name: createTemplateDto.name,
      message: 'Template creation not implemented yet',
    };
  }

  async getReportStats(userId: string) {
    const [total, byStatus, byType, byFormat] = await Promise.all([
      this.prisma.medicalReport.count(),
      this.prisma.medicalReport.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.medicalReport.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.medicalReport.groupBy({
        by: ['format'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
      byFormat: byFormat.map((item) => ({
        format: item.format,
        count: item._count,
      })),
    };
  }
}