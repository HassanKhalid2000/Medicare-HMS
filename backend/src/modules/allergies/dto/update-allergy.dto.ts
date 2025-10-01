import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateAllergyDto {
  @ApiPropertyOptional({ description: 'Allergen name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  allergen?: string;

  @ApiPropertyOptional({ description: 'Category/Type of allergy' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Reaction description' })
  @IsOptional()
  @IsString()
  reaction?: string;

  @ApiPropertyOptional({ description: 'Severity of allergy' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  severity?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Date diagnosed' })
  @IsOptional()
  diagnosedAt?: Date;

  @ApiPropertyOptional({ description: 'Whether the allergy is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
