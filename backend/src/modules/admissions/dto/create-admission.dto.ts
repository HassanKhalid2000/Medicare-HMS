import { IsString, IsEnum, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Ward, AdmissionType } from '@prisma/client';

export class CreateAdmissionDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ enum: Ward, description: 'Ward assignment' })
  @IsEnum(Ward)
  ward: Ward;

  @ApiProperty({ description: 'Room number', required: false })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({ description: 'Bed number', required: false })
  @IsString()
  @IsOptional()
  bedNumber?: string;

  @ApiProperty({ description: 'Admission date in YYYY-MM-DD format' })
  @IsDateString()
  admissionDate: string;

  @ApiProperty({ enum: AdmissionType, description: 'Type of admission' })
  @IsEnum(AdmissionType)
  admissionType: AdmissionType;

  @ApiProperty({ description: 'Reason for admission', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}