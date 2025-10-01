import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreatePatientDto {
  @ApiProperty({ description: 'Patient first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Patient last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-01' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ description: 'Gender', enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Patient address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Emergency contact name', required: false })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiProperty({ description: 'Patient status', enum: PatientStatus, default: PatientStatus.ACTIVE })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus = PatientStatus.ACTIVE;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

export class PatientQueryDto {
  @ApiProperty({ description: 'Search term for patient name, ID, or phone', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by status', enum: PatientStatus, required: false })
  @IsEnum(PatientStatus)
  @IsOptional()
  status?: PatientStatus;

  @ApiProperty({ description: 'Filter by gender', enum: Gender, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 10, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ description: 'Sort field', default: 'createdAt', required: false })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', default: 'desc', required: false })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}