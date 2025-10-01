import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity } from '@prisma/client';

export class MedicalAlertQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by patient ID',
    example: 'uuid-patient-id',
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by alert type',
    example: 'medication_reminder',
  })
  @IsOptional()
  @IsString()
  alertType?: string;

  @ApiPropertyOptional({
    description: 'Filter by severity level',
    enum: AlertSeverity,
    example: AlertSeverity.HIGH,
  })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by acknowledgment status',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAcknowledged?: boolean;

  @ApiPropertyOptional({
    description: 'Search in title and message',
    example: 'medication',
  })
  @IsOptional()
  @IsString()
  search?: string;
}