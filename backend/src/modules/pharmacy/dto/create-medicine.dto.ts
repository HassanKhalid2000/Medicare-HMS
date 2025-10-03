import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateMedicineDto {
  @ApiProperty({ description: 'Medicine name', example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Medicine category', example: 'Analgesic' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'Manufacturer name', example: 'Pfizer Inc.' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ description: 'Batch number', example: 'BATCH-2024-001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ description: 'Expiry date', example: '2025-12-31' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: 'Quantity in stock', example: 500 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Unit price', example: 5.50 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Minimum stock level', example: 50, default: 10 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumStock?: number;

  @ApiProperty({ description: 'Medicine description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Side effects information', required: false })
  @IsString()
  @IsOptional()
  sideEffects?: string;

  @ApiProperty({ description: 'Dosage information', required: false })
  @IsString()
  @IsOptional()
  dosageInfo?: string;
}
