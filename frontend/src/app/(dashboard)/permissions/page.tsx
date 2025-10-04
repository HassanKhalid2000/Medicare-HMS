'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Shield, Users as UsersIcon, Key, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import {
  getPermissions,
  getRoles,
  getGroups,
  createPermission,
  createRole,
  createGroup,
  updatePermission,
  updateRole,
  updateGroup,
  deletePermission,
  deleteRole,
  deleteGroup,
  type Permission,
  type Role,
  type Group,
} from '@/lib/api/permissions';
import { registerUser, type RegisterUserData } from '@/lib/api/auth';

const RESOURCE_TYPES = [
  'PATIENT', 'DOCTOR', 'APPOINTMENT', 'MEDICAL_RECORD', 'PRESCRIPTION',
  'LAB_TEST', 'BILLING', 'ADMISSION', 'USER', 'SETTINGS', 'REPORTS', 'PHARMACY', 'ALL'
];

const PERMISSION_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXECUTE'];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permsRes, rolesRes, groupsRes] = await Promise.all([
        getPermissions(),
        getRoles(),
        getGroups(),
      ]);
      setPermissions(permsRes.data);
      setRoles(rolesRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      toast.error('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permissions & Access Control</h1>
        <p className="text-muted-foreground mt-2">
          Manage permissions, roles, and groups for access control
        </p>
      </div>

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <PermissionsTab
            permissions={permissions}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab
            roles={roles}
            permissions={permissions}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="groups">
          <GroupsTab
            groups={groups}
            permissions={permissions}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="users">
          <CreateUserTab
            roles={roles}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PermissionsTab({ permissions, onRefresh }: { permissions: Permission[]; onRefresh: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, formData);
        toast.success('Permission updated successfully');
      } else {
        await createPermission(formData);
        toast.success('Permission created successfully');
      }
      setDialogOpen(false);
      setEditingPermission(null);
      setFormData({ name: '', description: '', resource: '', action: '' });
      onRefresh();
    } catch (error) {
      toast.error('Failed to save permission');
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource,
      action: permission.action,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    try {
      await deletePermission(id);
      toast.success('Permission deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete permission');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Manage individual permissions</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPermission(null); setFormData({ name: '', description: '', resource: '', action: '' }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingPermission ? 'Edit' : 'Create'} Permission</DialogTitle>
                <DialogDescription>
                  Define a new permission for the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Resource</Label>
                  <Select value={formData.resource} onValueChange={(value) => setFormData({ ...formData, resource: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_ACTIONS.map((action) => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingPermission ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell><Badge variant="outline">{permission.resource}</Badge></TableCell>
                <TableCell><Badge>{permission.action}</Badge></TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(permission)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(permission.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RolesTab({ roles, permissions, onRefresh }: { roles: Role[]; permissions: Permission[]; onRefresh: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        toast.success('Role updated successfully');
      } else {
        await createRole(formData);
        toast.success('Role created successfully');
      }
      setDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissionIds: [] });
      onRefresh();
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.permission.id),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRole(id);
      toast.success('Role deleted successfully');
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage role-based access control</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingRole(null); setFormData({ name: '', description: '', permissionIds: [] }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit' : 'Create'} Role</DialogTitle>
                <DialogDescription>
                  Create a role and assign permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.permissionIds.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              permissionIds: checked
                                ? [...formData.permissionIds, permission.id]
                                : formData.permissionIds.filter(id => id !== permission.id)
                            });
                          }}
                        />
                        <Label className="flex-1 cursor-pointer">
                          {permission.name} ({permission.resource}:{permission.action})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingRole ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                </TableCell>
                <TableCell>
                  {role.isSystem ? <Badge>System</Badge> : <Badge variant="outline">Custom</Badge>}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!role.isSystem && (
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(role.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function GroupsTab({ groups, permissions, onRefresh }: { groups: Group[]; permissions: Permission[]; onRefresh: () => void }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissionIds: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData);
        toast.success('Group updated successfully');
      } else {
        await createGroup(formData);
        toast.success('Group created successfully');
      }
      setDialogOpen(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', permissionIds: [] });
      onRefresh();
    } catch (error) {
      toast.error('Failed to save group');
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      permissionIds: group.permissions.map(p => p.permission.id),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await deleteGroup(id);
      toast.success('Group deleted successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete group');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Groups</CardTitle>
          <CardDescription>Manage group-based access control</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingGroup(null); setFormData({ name: '', description: '', permissionIds: [] }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingGroup ? 'Edit' : 'Create'} Group</DialogTitle>
                <DialogDescription>
                  Create a group and assign permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="border rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.permissionIds.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              permissionIds: checked
                                ? [...formData.permissionIds, permission.id]
                                : formData.permissionIds.filter(id => id !== permission.id)
                            });
                          }}
                        />
                        <Label className="flex-1 cursor-pointer">
                          {permission.name} ({permission.resource}:{permission.action})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingGroup ? 'Update' : 'Create'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{group.permissions.length} permissions</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(group)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(group.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreateUserTab({ roles, onRefresh }: { roles: Role[]; onRefresh: () => void }) {
  const [formData, setFormData] = useState<RegisterUserData>({
    email: '',
    password: '',
    fullName: '',
    role: 'doctor' as any,
    phone: '',
    department: '',
    employeeId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await registerUser(formData);
      toast.success('User created successfully with role permissions');

      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'doctor' as any,
        phone: '',
        department: '',
        employeeId: '',
      });

      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>
          Register a new user and automatically assign role-based permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                User will automatically receive permissions for this role
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating User...' : 'Create User'}
            </Button>
            <p className="text-sm text-muted-foreground">
              User will be active immediately with assigned role permissions
            </p>
          </div>

          {roles.length > 0 && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">Available Roles & Permissions:</h4>
              <div className="grid gap-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{role.name}</span>
                    <Badge variant="secondary">
                      {role.permissions?.length || 0} permissions
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
