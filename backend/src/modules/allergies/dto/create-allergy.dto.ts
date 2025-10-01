import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateAllergyDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Allergen name', example: 'Penicillin' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  allergen: string;

  @ApiProperty({ description: 'Category/Type of allergy', example: 'Medication' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  category: string;

  @ApiProperty({ description: 'Reaction description', example: 'Skin rash and difficulty breathing' })
  @IsNotEmpty()
  @IsString()
  reaction: string;

  @ApiProperty({ description: 'Severity of allergy', example: 'Severe' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  severity: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Date diagnosed', example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  diagnosedAt?: Date;
}
