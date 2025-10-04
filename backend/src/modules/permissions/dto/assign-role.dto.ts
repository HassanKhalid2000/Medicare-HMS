import { IsString, IsArray } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}

export class AssignGroupDto {
  @IsString()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  groupIds: string[];
}
