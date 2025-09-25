import { PartialType } from '@nestjs/mapped-types';
import { CreateDiagnosisDto } from './create-diagnosis.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateDiagnosisDto extends PartialType(CreateDiagnosisDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}