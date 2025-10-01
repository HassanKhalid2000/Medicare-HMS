import { PartialType } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdmissionStatus } from '@prisma/client';
import { CreateAdmissionDto } from './create-admission.dto';

export class UpdateAdmissionDto extends PartialType(CreateAdmissionDto) {
  @ApiProperty({ description: 'Discharge date in YYYY-MM-DD format', required: false })
  @IsDateString()
  @IsOptional()
  dischargeDate?: string;

  @ApiProperty({ enum: AdmissionStatus, description: 'Admission status', required: false })
  @IsEnum(AdmissionStatus)
  @IsOptional()
  status?: AdmissionStatus;

  @ApiProperty({ description: 'Discharge summary', required: false })
  @IsString()
  @IsOptional()
  dischargeSummary?: string;
}