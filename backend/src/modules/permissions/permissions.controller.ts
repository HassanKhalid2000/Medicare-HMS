import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignRoleDto, AssignGroupDto } from './dto/assign-role.dto';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Roles (must be before dynamic :id routes)
  @Post('roles')
  createRole(@Body() dto: CreateRoleDto) {
    return this.permissionsService.createRole(dto);
  }

  @Get('roles')
  getAllRoles() {
    return this.permissionsService.getAllRoles();
  }

  @Get('roles/:id')
  getRole(@Param('id') id: string) {
    return this.permissionsService.getRole(id);
  }

  @Put('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) {
    return this.permissionsService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string) {
    return this.permissionsService.deleteRole(id);
  }

  // Groups (must be before dynamic :id routes)
  @Post('groups')
  createGroup(@Body() dto: CreateGroupDto) {
    return this.permissionsService.createGroup(dto);
  }

  @Get('groups')
  getAllGroups() {
    return this.permissionsService.getAllGroups();
  }

  @Get('groups/:id')
  getGroup(@Param('id') id: string) {
    return this.permissionsService.getGroup(id);
  }

  @Put('groups/:id')
  updateGroup(@Param('id') id: string, @Body() dto: Partial<CreateGroupDto>) {
    return this.permissionsService.updateGroup(id, dto);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string) {
    return this.permissionsService.deleteGroup(id);
  }

  // User Assignments (must be before dynamic :id routes)
  @Post('users/assign-roles')
  assignRolesToUser(@Body() dto: AssignRoleDto) {
    return this.permissionsService.assignRolesToUser(dto);
  }

  @Post('users/assign-groups')
  assignGroupsToUser(@Body() dto: AssignGroupDto) {
    return this.permissionsService.assignGroupsToUser(dto);
  }

  @Get('users/:userId')
  getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }

  // Permissions (dynamic routes last)
  @Post()
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.createPermission(dto);
  }

  @Get()
  getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get(':id')
  getPermission(@Param('id') id: string) {
    return this.permissionsService.getPermission(id);
  }

  @Put(':id')
  updatePermission(@Param('id') id: string, @Body() dto: Partial<CreatePermissionDto>) {
    return this.permissionsService.updatePermission(id, dto);
  }

  @Delete(':id')
  deletePermission(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id);
  }
}
