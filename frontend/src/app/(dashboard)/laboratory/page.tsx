'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { laboratoryService, LabTest, TestType, TestStatus, TestUrgency, CreateLabTestDto, UpdateLabTestDto } from '@/services/laboratory';
import { patientsService } from '@/services/patients';
import { doctorsService } from '@/services/doctors';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit, Trash2, FileText, TestTube, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { LabTestForm } from '@/components/laboratory/lab-test-form';

export default function LaboratoryPage() {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const limit = 10;

  const loadLabTests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await laboratoryService.getLabTests({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter as TestStatus || undefined,
        testType: typeFilter as TestType || undefined,
      });
      setLabTests(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to load lab tests:', error);
      toast.error('Failed to load lab tests');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    loadLabTests();
  }, [loadLabTests]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (test: LabTest) => {
    try {
      const fullTest = await laboratoryService.getLabTest(test.id);
      setSelectedTest(fullTest);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Failed to load test details:', error);
      toast.error('Failed to load test details');
    }
  };

  const handleEdit = (test: LabTest) => {
    setSelectedTest(test);
    setIsEditing(true);
    setShowFormDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lab test?')) return;

    try {
      await laboratoryService.deleteLabTest(id);
      toast.success('Lab test deleted successfully');
      loadLabTests();
    } catch (error) {
      console.error('Failed to delete lab test:', error);
      toast.error('Failed to delete lab test');
    }
  };

  const handleCreateNew = () => {
    setSelectedTest(null);
    setIsEditing(false);
    setShowFormDialog(true);
  };

  const getStatusBadge = (status: TestStatus) => {
    const variants: Record<TestStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      [TestStatus.requested]: { variant: 'secondary', icon: Clock },
      [TestStatus.sample_collected]: { variant: 'outline', icon: TestTube },
      [TestStatus.processing]: { variant: 'default', icon: Clock },
      [TestStatus.completed]: { variant: 'default', icon: CheckCircle },
      [TestStatus.cancelled]: { variant: 'destructive', icon: XCircle },
      [TestStatus.failed]: { variant: 'destructive', icon: XCircle },
      [TestStatus.on_hold]: { variant: 'secondary', icon: Clock },
    };

    const { variant, icon: Icon } = variants[status] || { variant: 'default', icon: Clock };

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: TestUrgency) => {
    const colors: Record<TestUrgency, string> = {
      [TestUrgency.routine]: 'bg-gray-100 text-gray-800',
      [TestUrgency.urgent]: 'bg-orange-100 text-orange-800',
      [TestUrgency.stat]: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[urgency] || 'bg-gray-100 text-gray-800'}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laboratory</h2>
        <p className="text-muted-foreground">Manage lab tests and results</p>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Tests</CardTitle>
          <CardDescription>Search and filter lab tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by test number or patient name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter || 'all'} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="sample_collected">Sample Collected</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter || 'all'} onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BLOOD_TEST">Blood Test</SelectItem>
                  <SelectItem value="URINE_TEST">Urine Test</SelectItem>
                  <SelectItem value="X_RAY">X-Ray</SelectItem>
                  <SelectItem value="CT_SCAN">CT Scan</SelectItem>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="ECG">ECG</SelectItem>
                  <SelectItem value="ULTRASOUND">Ultrasound</SelectItem>
                  <SelectItem value="BIOPSY">Biopsy</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                New Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lab Tests Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : labTests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No lab tests found</div>
          ) : (
            <div className="space-y-4">
              {labTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{test.testNumber}</h3>
                      {getStatusBadge(test.status)}
                      {getUrgencyBadge(test.urgency)}
                      <Badge variant="outline">{test.testType.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">
                        {test.patient?.firstName} {test.patient?.lastName}
                      </span>
                      {' • '}
                      <span>Dr. {test.doctor?.name}</span>
                      {' • '}
                      <span>Requested {format(new Date(test.requestedAt), 'MMM dd, yyyy')}</span>
                      {test._count && test._count.labResults > 0 && (
                        <>
                          {' • '}
                          <span className="text-blue-600">{test._count.labResults} results</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(test)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(test)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} tests
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lab Test Details</DialogTitle>
            <DialogDescription>View complete lab test information</DialogDescription>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Test Number</label>
                  <p className="text-sm">{selectedTest.testNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient</label>
                  <p className="text-sm">
                    {selectedTest.patient?.firstName} {selectedTest.patient?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Doctor</label>
                  <p className="text-sm">Dr. {selectedTest.doctor?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Test Type</label>
                  <p className="text-sm">{selectedTest.testType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Urgency</label>
                  <div className="mt-1">{getUrgencyBadge(selectedTest.urgency)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requested At</label>
                  <p className="text-sm">{format(new Date(selectedTest.requestedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {selectedTest.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed At</label>
                    <p className="text-sm">{format(new Date(selectedTest.completedAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
              </div>

              {selectedTest.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm mt-1">{selectedTest.notes}</p>
                </div>
              )}

              {selectedTest.labResults && selectedTest.labResults.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Results</h3>
                  <div className="space-y-2">
                    {selectedTest.labResults.map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{result.parameter.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.value} {result.unit}
                              {result.referenceRange && ` (Reference: ${result.referenceRange})`}
                            </p>
                          </div>
                          <Badge variant={result.interpretation === 'normal' ? 'default' : 'destructive'}>
                            {result.interpretation}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Lab Test' : 'Create Lab Test'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update lab test information' : 'Order a new lab test'}
            </DialogDescription>
          </DialogHeader>
          <LabTestForm
            labTest={selectedTest}
            onSuccess={() => {
              setShowFormDialog(false);
              setSelectedTest(null);
              setIsEditing(false);
              loadLabTests();
            }}
            onCancel={() => {
              setShowFormDialog(false);
              setSelectedTest(null);
              setIsEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
