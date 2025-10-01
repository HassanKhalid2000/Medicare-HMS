import { IsOptional, IsString, IsDateString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TimelineQueryDto {
  @ApiPropertyOptional({ description: 'Start date for timeline filtering' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for timeline filtering' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Event types to include',
    enum: ['appointment', 'medical_record', 'diagnosis', 'prescription', 'vital_sign', 'admission', 'medical_document', 'all'],
    isArray: true
  })
  @IsOptional()
  @IsString({ each: true })
  @IsIn(['appointment', 'medical_record', 'diagnosis', 'prescription', 'vital_sign', 'admission', 'medical_document', 'all'], { each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Number of items to skip for pagination' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  offset?: number = 0;
}