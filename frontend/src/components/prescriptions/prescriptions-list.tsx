'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { Prescription, PrescriptionFilters, prescriptionsApi } from '@/lib/api/prescriptions';

interface PrescriptionsListProps {
  onCreatePrescription: () => void;
  onEditPrescription: (prescription: Prescription) => void;
  onViewPrescription: (prescription: Prescription) => void;
}

export function PrescriptionsList({
  onCreatePrescription,
  onEditPrescription,
  onViewPrescription,
}: PrescriptionsListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState<PrescriptionFilters>({
    page: 1,
    limit: 10,
  });

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionsApi.getPrescriptions(query);
      setPrescriptions(response.data);
      setTotal(response.meta.total);
      setCurrentPage(response.meta.page);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, [query]);

  const handleSearch = (search: string) => {
    setQuery({ ...query, search, page: 1 });
  };

  const handleFilterChange = (key: keyof PrescriptionFilters, value: any) => {
    setQuery({ ...query, [key]: value === 'all' ? undefined : value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setQuery({ ...query, page });
  };

  const handleActivate = async (prescription: Prescription) => {
    try {
      await prescriptionsApi.activatePrescription(prescription.id);
      loadPrescriptions();
    } catch (error) {
      console.error('Error activating prescription:', error);
    }
  };

  const handleDeactivate = async (prescription: Prescription) => {
    try {
      await prescriptionsApi.deactivatePrescription(prescription.id);
      loadPrescriptions();
    } catch (error) {
      console.error('Error deactivating prescription:', error);
    }
  };

  const handleDelete = async (prescription: Prescription) => {
    if (confirm(`Are you sure you want to delete this prescription? This action cannot be undone.`)) {
      try {
        await prescriptionsApi.deletePrescription(prescription.id);
        loadPrescriptions();
      } catch (error) {
        console.error('Error deleting prescription:', error);
      }
    }
  };

  const totalPages = Math.ceil(total / (query.limit || 10));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Prescriptions
          </h2>
          <p className="text-muted-foreground">
            Manage patient prescriptions and medications.
          </p>
        </div>
        <Button onClick={onCreatePrescription} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medicines, patients..."
                  value={query.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={query.isActive === undefined ? 'all' : query.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => handleFilterChange('isActive', value === 'all' ? undefined : value === 'active')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${total} prescription${total !== 1 ? 's' : ''} found`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPrescriptions}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions Table */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prescribed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(8)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No prescriptions found. Try adjusting your filters or create a new prescription.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((prescription) => (
                    <TableRow
                      key={prescription.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {prescription.medicalRecord?.patient?.firstName} {prescription.medicalRecord?.patient?.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {prescription.medicalRecord?.patient?.patientId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prescription.medicine?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {prescription.medicine?.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{prescription.dosage}</TableCell>
                      <TableCell>{prescription.frequency}</TableCell>
                      <TableCell>{prescription.duration}</TableCell>
                      <TableCell>
                        <Badge
                          variant={prescription.isActive ? 'default' : 'secondary'}
                          className={prescription.isActive ? 'bg-green-600' : 'bg-gray-600'}
                        >
                          {prescription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(prescription.prescribedAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewPrescription(prescription)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditPrescription(prescription)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {prescription.isActive ? (
                              <DropdownMenuItem onClick={() => handleDeactivate(prescription)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivate(prescription)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(prescription)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
