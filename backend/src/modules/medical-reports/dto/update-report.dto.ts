import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { ReportStatus } from '@prisma/client';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}