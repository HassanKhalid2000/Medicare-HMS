import { IsString, IsDate, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  doctorId: string;

  @ApiProperty({ description: 'Appointment date', example: '2024-01-15' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment time', example: '14:30' })
  @IsString()
  appointmentTime: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', default: 30 })
  @IsOptional()
  @IsNumber()
  @Min(15)
  duration?: number;

  @ApiProperty({
    description: 'Appointment type',
    enum: AppointmentType,
    example: AppointmentType.consultation
  })
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiPropertyOptional({
    description: 'Appointment status',
    enum: AppointmentStatus,
    default: AppointmentStatus.scheduled
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Patient symptoms' })
  @IsOptional()
  @IsString()
  symptoms?: string;
}