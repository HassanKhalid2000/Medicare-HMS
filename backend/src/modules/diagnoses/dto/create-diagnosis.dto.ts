import { IsString, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { DiagnosisType } from '@prisma/client';

export class CreateDiagnosisDto {
  @IsString()
  medicalRecordId: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  icd10Code?: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsEnum(DiagnosisType)
  type: DiagnosisType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  diagnosedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  severity?: string;
}