import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PermissionAction, ResourceType } from '@prisma/client';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ResourceType)
  resource: ResourceType;

  @IsEnum(PermissionAction)
  action: PermissionAction;
}
