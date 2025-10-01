import { PartialType } from '@nestjs/swagger';
import { CreateMedicalAlertDto } from './create-medical-alert.dto';
import { IsOptional, IsBoolean, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMedicalAlertDto extends PartialType(CreateMedicalAlertDto) {
  @ApiPropertyOptional({
    description: 'Timestamp when the alert was acknowledged',
    example: '2024-01-01T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;

  @ApiPropertyOptional({
    description: 'User who acknowledged the alert',
    example: 'dr.mohammed.ali@medicore.com',
  })
  @IsOptional()
  @IsString()
  acknowledgedBy?: string;
}