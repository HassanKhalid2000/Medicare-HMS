import api from './base';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: {
    permission: Permission;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  permissions: {
    permission: Permission;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  roles: Role[];
  groups: Group[];
  permissions: Permission[];
}

// Permissions
export const getPermissions = () => api.get<Permission[]>('/permissions');

export const getPermission = (id: string) => api.get<Permission>(`/permissions/${id}`);

export const createPermission = (data: {
  name: string;
  description?: string;
  resource: string;
  action: string;
}) => api.post<Permission>('/permissions', data);

export const updatePermission = (id: string, data: Partial<{
  name: string;
  description?: string;
  resource: string;
  action: string;
}>) => api.put<Permission>(`/permissions/${id}`, data);

export const deletePermission = (id: string) => api.delete(`/permissions/${id}`);

// Roles
export const getRoles = () => api.get<Role[]>('/permissions/roles');

export const getRole = (id: string) => api.get<Role>(`/permissions/roles/${id}`);

export const createRole = (data: {
  name: string;
  description?: string;
  isSystem?: boolean;
  permissionIds?: string[];
}) => api.post<Role>('/permissions/roles', data);

export const updateRole = (id: string, data: Partial<{
  name: string;
  description?: string;
  permissionIds?: string[];
}>) => api.put<Role>(`/permissions/roles/${id}`, data);

export const deleteRole = (id: string) => api.delete(`/permissions/roles/${id}`);

// Groups
export const getGroups = () => api.get<Group[]>('/permissions/groups');

export const getGroup = (id: string) => api.get<Group>(`/permissions/groups/${id}`);

export const createGroup = (data: {
  name: string;
  description?: string;
  permissionIds?: string[];
}) => api.post<Group>('/permissions/groups', data);

export const updateGroup = (id: string, data: Partial<{
  name: string;
  description?: string;
  permissionIds?: string[];
}>) => api.put<Group>(`/permissions/groups/${id}`, data);

export const deleteGroup = (id: string) => api.delete(`/permissions/groups/${id}`);

// User Assignments
export const assignRolesToUser = (data: {
  userId: string;
  roleIds: string[];
}) => api.post<UserPermissions>('/permissions/users/assign-roles', data);

export const assignGroupsToUser = (data: {
  userId: string;
  groupIds: string[];
}) => api.post<UserPermissions>('/permissions/users/assign-groups', data);

export const getUserPermissions = (userId: string) =>
  api.get<UserPermissions>(`/permissions/users/${userId}`);
