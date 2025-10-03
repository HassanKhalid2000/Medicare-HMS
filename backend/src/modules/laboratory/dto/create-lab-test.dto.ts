import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsDecimal, IsDateString, IsArray } from 'class-validator';

export enum TestType {
  BLOOD_TEST = 'BLOOD_TEST',
  URINE_TEST = 'URINE_TEST',
  X_RAY = 'X_RAY',
  CT_SCAN = 'CT_SCAN',
  MRI = 'MRI',
  ECG = 'ECG',
  ULTRASOUND = 'ULTRASOUND',
  BIOPSY = 'BIOPSY',
}

export enum TestUrgency {
  routine = 'routine',
  urgent = 'urgent',
  stat = 'stat',
}

export enum TestStatus {
  requested = 'requested',
  sample_collected = 'sample_collected',
  processing = 'processing',
  completed = 'completed',
  cancelled = 'cancelled',
  failed = 'failed',
  on_hold = 'on_hold',
}

export class CreateLabTestDto {
  @ApiProperty({ description: 'Patient ID', example: 'abc123' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID', example: 'doc123' })
  @IsString()
  doctorId: string;

  @ApiProperty({ description: 'Test type', enum: TestType })
  @IsEnum(TestType)
  testType: TestType;

  @ApiProperty({ description: 'Test urgency', enum: TestUrgency, default: TestUrgency.routine })
  @IsEnum(TestUrgency)
  @IsOptional()
  urgency?: TestUrgency;

  @ApiProperty({ description: 'Sample information', required: false })
  @IsString()
  @IsOptional()
  sampleInfo?: string;

  @ApiProperty({ description: 'Test cost', example: '150.00', required: false })
  @IsDecimal()
  @IsOptional()
  cost?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Panel IDs to include', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  panelIds?: string[];
}
