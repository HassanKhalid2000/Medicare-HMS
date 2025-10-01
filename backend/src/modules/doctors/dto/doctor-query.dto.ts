import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Specialization, DoctorStatus } from '@prisma/client';

export class DoctorQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or doctor ID' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by specialization', enum: Specialization })
  @IsOptional()
  @IsEnum(Specialization)
  specialization?: Specialization;

  @ApiPropertyOptional({ description: 'Filter by status', enum: DoctorStatus })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}