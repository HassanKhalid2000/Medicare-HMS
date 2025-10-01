import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AdmissionStatus, AdmissionType, Ward } from '@prisma/client';

export class AdmissionQueryDto {
  @ApiProperty({ description: 'Search term for patient name or admission details', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by patient ID', required: false })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiProperty({ description: 'Filter by doctor ID', required: false })
  @IsString()
  @IsOptional()
  doctorId?: string;

  @ApiProperty({ enum: AdmissionStatus, description: 'Filter by admission status', required: false })
  @IsEnum(AdmissionStatus)
  @IsOptional()
  status?: AdmissionStatus;

  @ApiProperty({ enum: AdmissionType, description: 'Filter by admission type', required: false })
  @IsEnum(AdmissionType)
  @IsOptional()
  admissionType?: AdmissionType;

  @ApiProperty({ enum: Ward, description: 'Filter by ward', required: false })
  @IsEnum(Ward)
  @IsOptional()
  ward?: Ward;

  @ApiProperty({ description: 'Filter by admission date from (YYYY-MM-DD)', required: false })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({ description: 'Filter by admission date to (YYYY-MM-DD)', required: false })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ description: 'Sort by field', required: false, default: 'admissionDate' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'admissionDate';

  @ApiProperty({ description: 'Sort order', required: false, default: 'desc' })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}