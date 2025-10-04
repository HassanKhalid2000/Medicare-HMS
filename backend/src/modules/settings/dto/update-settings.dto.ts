import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsObject } from 'class-validator';

export enum SettingCategory {
  PROFILE = 'profile',
  HOSPITAL = 'hospital',
  APPEARANCE = 'appearance',
  NOTIFICATION = 'notification',
}

export class UpdateSettingsDto {
  @IsEnum(SettingCategory)
  @IsNotEmpty()
  category: SettingCategory;

  @IsObject()
  @IsNotEmpty()
  settings: Record<string, any>;
}

export class UpdateProfileSettingsDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class UpdateHospitalSettingsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;
}

export class UpdateAppearanceSettingsDto {
  @IsString()
  @IsOptional()
  theme?: string; // light, dark, system

  @IsString()
  @IsOptional()
  language?: string; // en, ar, es, fr

  @IsString()
  @IsOptional()
  dateFormat?: string; // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD

  @IsString()
  @IsOptional()
  timeFormat?: string; // 12h, 24h
}

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  appointmentReminders?: boolean;

  @IsBoolean()
  @IsOptional()
  billingAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  systemUpdates?: boolean;
}
