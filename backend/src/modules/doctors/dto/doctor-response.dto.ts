import { ApiProperty } from '@nestjs/swagger';
import { Specialization, DoctorStatus } from '@prisma/client';

export class DoctorResponseDto {
  @ApiProperty({ description: 'Doctor unique ID' })
  id: string;

  @ApiProperty({ description: 'Doctor ID for display' })
  doctorId: string;

  @ApiProperty({ description: 'Doctor full name' })
  name: string;

  @ApiProperty({ description: 'Doctor specialization', enum: Specialization })
  specialization: Specialization;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Medical license number' })
  licenseNumber: string;

  @ApiProperty({ description: 'Years of experience' })
  experienceYears: number;

  @ApiProperty({ description: 'Work schedule' })
  schedule: string | null;

  @ApiProperty({ description: 'Consultation fee' })
  consultationFee: string;

  @ApiProperty({ description: 'Doctor status', enum: DoctorStatus })
  status: DoctorStatus;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}