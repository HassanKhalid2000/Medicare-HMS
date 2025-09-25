import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { MedicalRecordType } from '@prisma/client';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'Patient ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({
    description: 'Appointment ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false
  })
  @IsUUID()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({
    description: 'Type of medical record',
    enum: MedicalRecordType,
    example: MedicalRecordType.VISIT_NOTE
  })
  @IsEnum(MedicalRecordType)
  @IsNotEmpty()
  recordType: MedicalRecordType;

  @ApiProperty({ description: 'Title of the medical record', example: 'Annual Physical Examination' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Chief complaint',
    example: 'Patient complains of chest pain for 2 days',
    required: false
  })
  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @ApiProperty({
    description: 'History of present illness',
    example: 'Patient reports intermittent chest pain...',
    required: false
  })
  @IsString()
  @IsOptional()
  historyPresent?: string;

  @ApiProperty({
    description: 'Review of systems',
    example: 'Cardiovascular: Positive for chest pain...',
    required: false
  })
  @IsString()
  @IsOptional()
  reviewSystems?: string;

  @ApiProperty({
    description: 'Physical examination findings',
    example: 'Vital signs stable, no acute distress...',
    required: false
  })
  @IsString()
  @IsOptional()
  physicalExam?: string;

  @ApiProperty({
    description: 'Assessment and diagnosis',
    example: 'Likely gastroesophageal reflux...',
    required: false
  })
  @IsString()
  @IsOptional()
  assessment?: string;

  @ApiProperty({
    description: 'Treatment plan',
    example: 'Start PPI therapy, follow up in 2 weeks...',
    required: false
  })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiProperty({
    description: 'Follow-up instructions',
    example: 'Return if symptoms worsen or persist...',
    required: false
  })
  @IsString()
  @IsOptional()
  followUpInstructions?: string;
}