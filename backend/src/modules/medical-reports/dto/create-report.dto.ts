import { IsString, IsOptional, IsEnum, IsObject, IsDateString } from 'class-validator';
import { ReportType, ReportFormat } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsObject()
  filters?: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    doctorId?: string;
    departmentId?: string;
    [key: string]: any;
  };

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}