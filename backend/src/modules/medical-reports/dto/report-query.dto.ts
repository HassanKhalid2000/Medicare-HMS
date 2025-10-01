import { IsOptional, IsEnum, IsDateString, IsString, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ReportType, ReportStatus, ReportFormat } from '@prisma/client';

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @IsString()
  requestedBy?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'requestedAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}