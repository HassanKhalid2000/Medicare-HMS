import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class CreateMedicalDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  medicalRecordId?: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filePath: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty()
  @IsInt()
  fileSize: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uploadedBy: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}