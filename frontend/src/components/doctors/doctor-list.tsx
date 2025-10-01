'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Doctor,
  DoctorQuery,
  DoctorStatus,
  Specialization,
  specializationLabels,
  statusLabels
} from '@/types/doctor';

interface DoctorListProps {
  onCreateDoctor: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onViewDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctor: Doctor) => void;
  refreshKey?: number;
}

export function DoctorList({
  onCreateDoctor,
  onEditDoctor,
  onViewDoctor,
  onDeleteDoctor,
  refreshKey
}: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<DoctorQuery>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Load doctors from API
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const { doctorsService } = await import('@/services/doctors');
        const response = await doctorsService.getDoctors(query);

        setDoctors(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error('Failed to load doctors:', error);
        setDoctors([]);
        setMeta({ total: 0, page: 1, limit: 10, totalPages: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [query, refreshKey]);

  const getStatusColor = (status: DoctorStatus) => {
    switch (status) {
      case DoctorStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case DoctorStatus.INACTIVE:
        return 'bg-red-100 text-red-800';
      case DoctorStatus.ON_LEAVE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (value: string) => {
    setQuery(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (field: keyof DoctorQuery, value: string) => {
    setQuery(prev => ({
      ...prev,
      [field]: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doctors</CardTitle>
          <CardDescription>Loading doctors...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Doctors</h2>
          <p className="text-muted-foreground">
            Manage hospital doctors and their information.
          </p>
        </div>
        <Button onClick={onCreateDoctor} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search doctors by name or ID..."
                  value={query.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={query.specialization || 'all'}
                onValueChange={(value) => handleFilterChange('specialization', value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {Object.entries(specializationLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={query.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Doctors List ({meta.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Consultation Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        {doctor.doctorId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {specializationLabels[doctor.specialization]}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{doctor.phone}</div>
                          <div className="text-muted-foreground">
                            License: {doctor.licenseNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doctor.experienceYears} years
                      </TableCell>
                      <TableCell>
                        ${doctor.consultationFee}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(doctor.status)}
                        >
                          {statusLabels[doctor.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onViewDoctor(doctor)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEditDoctor(doctor)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Doctor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteDoctor(doctor)}
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Doctor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination would go here */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(prev => ({ ...prev, page: prev.page! - 1 }))}
                  disabled={meta.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(prev => ({ ...prev, page: prev.page! + 1 }))}
                  disabled={meta.page >= meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}