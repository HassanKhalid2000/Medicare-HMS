import { IsString, IsEnum, IsOptional, IsObject, IsUUID } from 'class-validator';
import { TemplateInstanceStatus } from '@prisma/client';

export class CreateTemplateInstanceDto {
  @IsUUID()
  templateId: string;

  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  medicalRecordId?: string;

  @IsObject()
  filledData: any; // JSON filled template data

  @IsOptional()
  @IsEnum(TemplateInstanceStatus)
  status?: TemplateInstanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}