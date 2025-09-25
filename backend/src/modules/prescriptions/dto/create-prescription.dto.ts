import { IsString, IsInt, IsOptional, IsDateString, IsBoolean, Min, Max } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  medicalRecordId: string;

  @IsString()
  medicineId: string;

  @IsString()
  dosage: string;

  @IsString()
  frequency: string;

  @IsString()
  duration: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  @Max(11)
  refills: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  warnings?: string;

  @IsOptional()
  @IsDateString()
  prescribedAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}