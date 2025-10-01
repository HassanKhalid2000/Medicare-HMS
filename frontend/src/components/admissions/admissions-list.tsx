'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Admission,
  AdmissionQuery,
  AdmissionStatus,
  AdmissionType,
  Ward,
  admissionStatusLabels,
  admissionStatusColors,
  admissionTypeLabels,
  wardLabels,
  wardColors,
} from '@/types/admission';

interface AdmissionsListProps {
  onCreateAdmission: () => void;
  onEditAdmission: (admission: Admission) => void;
  onViewAdmission: (admission: Admission) => void;
}

export function AdmissionsList({
  onCreateAdmission,
  onEditAdmission,
  onViewAdmission,
}: AdmissionsListProps) {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState<AdmissionQuery>({
    page: 1,
    limit: 10,
    sortBy: 'admissionDate',
    sortOrder: 'desc',
  });

  const loadAdmissions = async () => {
    try {
      setLoading(true);
      const { admissionsService } = await import('@/services/admissions');
      const response = await admissionsService.getAdmissions(query);

      setAdmissions(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.page);
    } catch (error) {
      console.error('Error loading admissions:', error);
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissions();
  }, [query]);

  const handleSearch = (search: string) => {
    setQuery({ ...query, search, page: 1 });
  };

  const handleFilterChange = (key: keyof AdmissionQuery, value: string) => {
    setQuery({ ...query, [key]: value || undefined, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setQuery({ ...query, page });
  };

  const handleDischarge = async (admission: Admission) => {
    try {
      const { admissionsService } = await import('@/services/admissions');
      await admissionsService.dischargePatient(admission.id);
      loadAdmissions();
    } catch (error) {
      console.error('Error discharging patient:', error);
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Patient Admissions
          </h2>
          <p className="text-muted-foreground">
            Manage hospital patient admissions and ward assignments.
          </p>
        </div>
        <Button onClick={onCreateAdmission} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
          <Plus className="h-4 w-4" />
          New Admission
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients, doctors, or rooms..."
                  value={query.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={query.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(admissionStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ward</label>
              <Select
                value={query.ward || 'all'}
                onValueChange={(value) => handleFilterChange('ward', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {Object.entries(wardLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={query.admissionType || 'all'}
                onValueChange={(value) => handleFilterChange('admissionType', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(admissionTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${total} admission${total !== 1 ? 's' : ''} found`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAdmissions}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admissions Table */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Ward & Room</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : admissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No admissions found. Try adjusting your filters or create a new admission.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  admissions.map((admission) => (
                    <TableRow
                      key={admission.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {admission.patient?.firstName} {admission.patient?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {admission.patient?.patientId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{admission.doctor?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {admission.doctor?.specialization}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="secondary" className={wardColors[admission.ward]}>
                            {wardLabels[admission.ward]}
                          </Badge>
                          {admission.roomNumber && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Room {admission.roomNumber}
                              {admission.bedNumber && `, Bed ${admission.bedNumber}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                          </div>
                          {admission.dischargeDate && (
                            <div className="text-sm text-muted-foreground">
                              Discharged: {format(new Date(admission.dischargeDate), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {admissionTypeLabels[admission.admissionType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={admissionStatusColors[admission.status]}
                        >
                          {admissionStatusLabels[admission.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewAdmission(admission)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditAdmission(admission)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {admission.status === AdmissionStatus.ADMITTED && (
                              <DropdownMenuItem onClick={() => handleDischarge(admission)}>
                                <UserX className="mr-2 h-4 w-4" />
                                Discharge
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * (query.limit || 10)) + 1} to{' '}
                {Math.min(currentPage * (query.limit || 10), total)} of {total} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}