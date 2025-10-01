import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity } from '@prisma/client';

export class CreateMedicalAlertDto {
  @ApiProperty({
    description: 'Patient ID to associate the alert with',
    example: 'uuid-patient-id',
  })
  @IsString()
  patientId: string;

  @ApiProperty({
    description: 'Type/category of the medical alert',
    example: 'medication_reminder',
    enum: [
      'medication_reminder',
      'appointment_followup',
      'lab_results_critical',
      'vital_signs_abnormal',
      'allergy_warning',
      'drug_interaction',
      'chronic_disease_monitoring',
      'vaccination_due',
      'medication_refill',
      'appointment_missed',
      'critical_lab_value',
      'emergency_contact',
      'insurance_expiry',
      'treatment_plan_update',
    ],
  })
  @IsString()
  alertType: string;

  @ApiProperty({
    description: 'Alert title/summary',
    example: 'Blood Pressure Medication Reminder',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed alert message',
    example: 'Patient needs to take Lisinopril 10mg at 8:00 AM daily. Last dose was taken 2 days ago.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Alert severity level',
    enum: AlertSeverity,
    example: AlertSeverity.MEDIUM,
  })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiPropertyOptional({
    description: 'Whether the alert is currently active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'When the alert expires and should be automatically deactivated',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}