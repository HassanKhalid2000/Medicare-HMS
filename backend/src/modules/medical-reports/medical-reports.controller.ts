import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  StreamableFile,
  Response,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { MedicalReportsService } from './medical-reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('medical-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalReportsController {
  constructor(private readonly medicalReportsService: MedicalReportsService) {}

  @Post()
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    try {
      const report = await this.medicalReportsService.create(
        createReportDto,
        req.user.userId,
      );
      return {
        success: true,
        data: report,
        message: 'Medical report created successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create medical report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async findAll(@Query() query: ReportQueryDto, @Request() req) {
    try {
      const reports = await this.medicalReportsService.findAll(query, req.user.userId);
      return {
        success: true,
        data: reports.data,
        meta: reports.meta,
        message: 'Medical reports retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve medical reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async getTemplates(@Request() req) {
    try {
      // const templates = await this.medicalReportsService.getTemplates(req.user.userId);
      const templates = [];
      return {
        success: true,
        data: templates,
        message: 'Report templates retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve report templates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('templates')
  @Roles(UserRole.doctor, UserRole.admin)
  async createTemplate(@Body() createTemplateDto: CreateReportTemplateDto, @Request() req) {
    try {
      const template = await this.medicalReportsService.createTemplate(
        createTemplateDto,
        req.user.userId,
      );
      return {
        success: true,
        data: template,
        message: 'Report template created successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create report template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates/:id')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async getTemplate(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    try {
      // const template = await this.medicalReportsService.getTemplate(id, req.user.userId);
      const template = null;
      return {
        success: true,
        data: template,
        message: 'Report template retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve report template',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch('templates/:id')
  @Roles(UserRole.doctor, UserRole.admin)
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: Partial<CreateReportTemplateDto>,
    @Request() req,
  ) {
    try {
      // const template = await this.medicalReportsService.updateTemplate(
      //   id,
      //   updateTemplateDto,
      //   req.user.userId,
      // );
      const template = null;
      return {
        success: true,
        data: template,
        message: 'Report template updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update report template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('templates/:id')
  @Roles(UserRole.doctor, UserRole.admin)
  async deleteTemplate(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    try {
      // await this.medicalReportsService.deleteTemplate(id, req.user.userId);
      return {
        success: true,
        message: 'Report template deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete report template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    try {
      const report = await this.medicalReportsService.findOne(id, req.user.userId);
      return {
        success: true,
        data: report,
        message: 'Medical report retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Medical report not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }


  @Patch(':id')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req,
  ) {
    try {
      const report = await this.medicalReportsService.update(id, updateReportDto, req.user.userId);
      return {
        success: true,
        data: report,
        message: 'Medical report updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update medical report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.doctor, UserRole.admin)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    try {
      await this.medicalReportsService.remove(id, req.user.userId);
      return {
        success: true,
        message: 'Medical report deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete medical report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/summary')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  async getReportStats(@Request() req) {
    try {
      const stats = await this.medicalReportsService.getReportStats(req.user.userId);
      return {
        success: true,
        data: stats,
        message: 'Report statistics retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve report statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'PDF':
        return 'application/pdf';
      case 'CSV':
        return 'text/csv';
      case 'EXCEL':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'JSON':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}