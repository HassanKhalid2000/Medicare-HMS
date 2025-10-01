import { IsString, IsOptional, IsEnum, IsObject, IsBoolean } from 'class-validator';
import { ReportType, ReportFormat } from '@prisma/client';

export class CreateReportTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsEnum(ReportFormat)
  defaultFormat?: ReportFormat;

  @IsObject()
  templateConfig: {
    sections: Array<{
      id: string;
      title: string;
      type: 'table' | 'chart' | 'text' | 'list' | 'header';
      fields: string[];
      settings?: Record<string, any>;
    }>;
    styling?: {
      fontSize?: number;
      fontFamily?: string;
      margins?: { top: number; right: number; bottom: number; left: number };
      colors?: Record<string, string>;
    };
    filters?: string[];
  };

  @IsOptional()
  @IsObject()
  defaultParams?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}