'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Pill, Calendar, User, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Prescription, prescriptionsApi, PrescriptionFilters } from '@/lib/api/prescriptions';
import { formatDate, formatDateTime } from '@/lib/utils';
import CreatePrescriptionDialog from '@/components/prescriptions/CreatePrescriptionDialog';
import PrescriptionDetails from '@/components/prescriptions/PrescriptionDetails';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const filters: PrescriptionFilters = {
        page: currentPage,
        limit: 10,
        ...(selectedStatus === 'active' && { isActive: true }),
        ...(selectedStatus === 'inactive' && { isActive: false }),
      };

      const response = await prescriptionsApi.getPrescriptions(filters);
      setPrescriptions(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [currentPage, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPrescriptions();
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      prescription.medicine.name.toLowerCase().includes(searchLower) ||
      prescription.dosage.toLowerCase().includes(searchLower) ||
      prescription.frequency.toLowerCase().includes(searchLower) ||
      prescription.medicalRecord.patient.firstName.toLowerCase().includes(searchLower) ||
      prescription.medicalRecord.patient.lastName.toLowerCase().includes(searchLower) ||
      prescription.instructions?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchPrescriptions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground">Manage patient prescriptions and monitor drug interactions</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="sr-only">Create New Prescription</DialogTitle>
            <CreatePrescriptionDialog
              onSuccess={handleCreateSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search prescriptions, medicines, patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Activity className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Prescriptions List */}
      <div className="grid gap-4">
        {filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Prescriptions Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No prescriptions match your search criteria.'
                  : 'Get started by creating your first prescription.'}
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogTitle className="sr-only">Create New Prescription</DialogTitle>
                  <CreatePrescriptionDialog
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          filteredPrescriptions.map((prescription) => (
            <Card
              key={prescription.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPrescription(prescription)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{prescription.medicine.name}</CardTitle>
                      {!prescription.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {prescription.refills <= 0 && prescription.isActive && (
                        <Badge variant="destructive">No Refills</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Pill className="h-4 w-4 mr-1" />
                      {prescription.medicine.category} • {prescription.medicine.manufacturer}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {prescription.medicalRecord.patient.firstName} {prescription.medicalRecord.patient.lastName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(prescription.prescribedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={prescription.isActive ? 'default' : 'secondary'}>
                      {prescription.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {prescription.refills} refills left
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Dosage:</span>
                      <p>{prescription.dosage}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Frequency:</span>
                      <p>{prescription.frequency}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Duration:</span>
                      <p>{prescription.duration}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Quantity:</span>
                      <p>{prescription.quantity}</p>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Instructions:</p>
                      <p className="text-sm line-clamp-2">{prescription.instructions}</p>
                    </div>
                  )}
                  {prescription.warnings && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800 line-clamp-2">{prescription.warnings}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Medical Record: {prescription.medicalRecord.title}</span>
                    <span>Created: {formatDateTime(prescription.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Prescription Details Dialog */}
      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Prescription Details</DialogTitle>
          {selectedPrescription && (
            <PrescriptionDetails
              prescription={selectedPrescription}
              onClose={() => setSelectedPrescription(null)}
              onUpdate={fetchPrescriptions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}