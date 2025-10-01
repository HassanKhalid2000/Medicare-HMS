import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VitalSignType } from '@prisma/client';

export class CreateVitalSignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  medicalRecordId?: string;

  @ApiProperty({ enum: VitalSignType })
  @IsEnum(VitalSignType)
  type: VitalSignType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  normalRange?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  measuredBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  measuredAt?: string;
}