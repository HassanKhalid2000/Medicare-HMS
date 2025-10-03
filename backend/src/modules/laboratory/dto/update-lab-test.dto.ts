import { PartialType } from '@nestjs/swagger';
import { CreateLabTestDto, TestStatus } from './create-lab-test.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateLabTestDto extends PartialType(CreateLabTestDto) {
  @ApiProperty({ description: 'Test status', enum: TestStatus, required: false })
  @IsEnum(TestStatus)
  @IsOptional()
  status?: TestStatus;

  @ApiProperty({ description: 'Test results', required: false })
  @IsString()
  @IsOptional()
  results?: string;

  @ApiProperty({ description: 'Normal ranges', required: false })
  @IsString()
  @IsOptional()
  normalRanges?: string;

  @ApiProperty({ description: 'Technician name', required: false })
  @IsString()
  @IsOptional()
  technician?: string;

  @ApiProperty({ description: 'Sample collection date/time', required: false })
  @IsDateString()
  @IsOptional()
  collectedAt?: Date;

  @ApiProperty({ description: 'Test completion date/time', required: false })
  @IsDateString()
  @IsOptional()
  completedAt?: Date;

  @ApiProperty({ description: 'Report URL', required: false })
  @IsString()
  @IsOptional()
  reportUrl?: string;
}
