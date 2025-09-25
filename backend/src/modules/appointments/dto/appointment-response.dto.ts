import { ApiProperty } from '@nestjs/swagger';
import { AppointmentType, AppointmentStatus } from '@prisma/client';

export class AppointmentResponseDto {
  @ApiProperty({ description: 'Appointment unique ID' })
  id: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  doctorId: string;

  @ApiProperty({ description: 'Appointment date' })
  appointmentDate: Date;

  @ApiProperty({ description: 'Appointment time' })
  appointmentTime: Date;

  @ApiProperty({ description: 'Duration in minutes' })
  duration: number;

  @ApiProperty({ description: 'Appointment type', enum: AppointmentType })
  type: AppointmentType;

  @ApiProperty({ description: 'Appointment status', enum: AppointmentStatus })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Additional notes' })
  notes: string | null;

  @ApiProperty({ description: 'Patient symptoms' })
  symptoms: string | null;

  @ApiProperty({ description: 'Doctor diagnosis' })
  diagnosis: string | null;

  @ApiProperty({ description: 'Prescription details' })
  prescription: string | null;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  // Relations
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };

  doctor?: {
    id: string;
    doctorId: string;
    name: string;
    specialization: string;
    consultationFee: string;
  };
}