import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Specialization, DoctorStatus } from '@prisma/client';

export class CreateDoctorDto {
  @ApiProperty({ description: 'Doctor full name', example: 'Dr. John Smith' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Doctor specialization',
    enum: Specialization,
    example: Specialization.CARDIOLOGY
  })
  @IsEnum(Specialization)
  specialization: Specialization;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email address', example: 'dr.john@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Medical license number', example: 'LIC123456' })
  @IsString()
  licenseNumber: string;

  @ApiPropertyOptional({ description: 'Years of experience', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Work schedule in JSON format' })
  @IsOptional()
  @IsString()
  schedule?: string;

  @ApiPropertyOptional({ description: 'Consultation fee', example: 150.00 })
  @IsOptional()
  @IsDecimal()
  consultationFee?: string;

  @ApiPropertyOptional({
    description: 'Doctor status',
    enum: DoctorStatus,
    example: DoctorStatus.active
  })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;
}