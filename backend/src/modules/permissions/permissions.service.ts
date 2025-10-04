import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignRoleDto, AssignGroupDto } from './dto/assign-role.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Permissions
  async createPermission(dto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: dto,
    });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    });
  }

  async getPermission(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async updatePermission(id: string, dto: Partial<CreatePermissionDto>) {
    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.delete({
      where: { id },
    });
  }

  // Roles
  async createRole(dto: CreateRoleDto) {
    const { permissionIds, ...roleData } = dto;

    const role = await this.prisma.role.create({
      data: roleData,
    });

    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissionsToRole(role.id, permissionIds);
    }

    return this.getRole(role.id);
  }

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async updateRole(id: string, dto: Partial<CreateRoleDto>) {
    const { permissionIds, ...roleData } = dto;

    const role = await this.prisma.role.update({
      where: { id },
      data: roleData,
    });

    if (permissionIds !== undefined) {
      // Remove existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await this.assignPermissionsToRole(id, permissionIds);
      }
    }

    return this.getRole(id);
  }

  async deleteRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system role');
    }

    return this.prisma.role.delete({
      where: { id },
    });
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const data = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await this.prisma.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Groups
  async createGroup(dto: CreateGroupDto) {
    const { permissionIds, ...groupData } = dto;

    const group = await this.prisma.group.create({
      data: groupData,
    });

    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissionsToGroup(group.id, permissionIds);
    }

    return this.getGroup(group.id);
  }

  async getAllGroups() {
    return this.prisma.group.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getGroup(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  async updateGroup(id: string, dto: Partial<CreateGroupDto>) {
    const { permissionIds, ...groupData } = dto;

    const group = await this.prisma.group.update({
      where: { id },
      data: groupData,
    });

    if (permissionIds !== undefined) {
      // Remove existing permissions
      await this.prisma.groupPermission.deleteMany({
        where: { groupId: id },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await this.assignPermissionsToGroup(id, permissionIds);
      }
    }

    return this.getGroup(id);
  }

  async deleteGroup(id: string) {
    return this.prisma.group.delete({
      where: { id },
    });
  }

  async assignPermissionsToGroup(groupId: string, permissionIds: string[]) {
    const data = permissionIds.map((permissionId) => ({
      groupId,
      permissionId,
    }));

    await this.prisma.groupPermission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // User Role & Group Assignment
  async assignRolesToUser(dto: AssignRoleDto) {
    const { userId, roleIds } = dto;

    // Remove existing roles
    await this.prisma.userRole_New.deleteMany({
      where: { userId },
    });

    // Assign new roles
    const data = roleIds.map((roleId) => ({
      userId,
      roleId,
    }));

    await this.prisma.userRole_New.createMany({
      data,
      skipDuplicates: true,
    });

    return this.getUserPermissions(userId);
  }

  async assignGroupsToUser(dto: AssignGroupDto) {
    const { userId, groupIds } = dto;

    // Remove existing groups
    await this.prisma.userGroup.deleteMany({
      where: { userId },
    });

    // Assign new groups
    const data = groupIds.map((groupId) => ({
      userId,
      groupId,
    }));

    await this.prisma.userGroup.createMany({
      data,
      skipDuplicates: true,
    });

    return this.getUserPermissions(userId);
  }

  // Get User Permissions
  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        userGroups: {
          include: {
            group: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Collect all permissions from roles and groups
    const permissions = new Map();

    user.userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((rp) => {
        permissions.set(rp.permission.id, rp.permission);
      });
    });

    user.userGroups.forEach((userGroup) => {
      userGroup.group.permissions.forEach((gp) => {
        permissions.set(gp.permission.id, gp.permission);
      });
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      roles: user.userRoles.map((ur) => ur.role),
      groups: user.userGroups.map((ug) => ug.group),
      permissions: Array.from(permissions.values()),
    };
  }

  // Check if user has specific permission
  async userHasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    return userPermissions.permissions.some(
      (p) => (p.resource === resource || p.resource === 'ALL') && p.action === action
    );
  }
}
