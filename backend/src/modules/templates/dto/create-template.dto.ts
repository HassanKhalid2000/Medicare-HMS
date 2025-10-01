import { IsString, IsEnum, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MedicalTemplateCategory, MedicalTemplateType } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MedicalTemplateCategory)
  category: MedicalTemplateCategory;

  @IsEnum(MedicalTemplateType)
  templateType: MedicalTemplateType;

  @IsObject()
  content: any; // JSON template structure

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;
}