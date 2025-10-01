'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Calendar, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Diagnosis, diagnosesApi, DiagnosisFilters } from '@/lib/api/diagnoses';
import { formatDate, formatDateTime } from '@/lib/utils';
import CreateDiagnosisDialog from '@/components/diagnoses/CreateDiagnosisDialog';
import DiagnosisDetails from '@/components/diagnoses/DiagnosisDetails';

const diagnosisTypeLabels = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  DIFFERENTIAL: 'Differential',
  PROVISIONAL: 'Provisional',
  FINAL: 'Final',
};

const diagnosisTypeBadgeColors = {
  PRIMARY: 'destructive',
  SECONDARY: 'secondary',
  DIFFERENTIAL: 'outline',
  PROVISIONAL: 'default',
  FINAL: 'default',
} as const;

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      const filters: DiagnosisFilters = {
        page: currentPage,
        limit: 10,
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedStatus === 'active' && { isActive: true }),
        ...(selectedStatus === 'inactive' && { isActive: false }),
      };

      const response = await diagnosesApi.getDiagnoses(filters);
      setDiagnoses(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diagnoses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, [currentPage, selectedType, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDiagnoses();
  };

  const filteredDiagnoses = diagnoses.filter((diagnosis) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      diagnosis.description.toLowerCase().includes(searchLower) ||
      diagnosis.icd10Code?.toLowerCase().includes(searchLower) ||
      diagnosis.patient.firstName.toLowerCase().includes(searchLower) ||
      diagnosis.patient.lastName.toLowerCase().includes(searchLower) ||
      diagnosis.notes?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchDiagnoses();
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
          <h1 className="text-3xl font-bold">Diagnoses</h1>
          <p className="text-muted-foreground">Manage patient diagnoses and medical conditions</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Diagnosis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Create New Diagnosis</DialogTitle>
            <CreateDiagnosisDialog
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
                  placeholder="Search diagnoses, ICD-10 codes, patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Diagnosis Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(diagnosisTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Diagnoses List */}
      <div className="grid gap-4">
        {filteredDiagnoses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Diagnoses Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No diagnoses match your search criteria.'
                  : 'Get started by creating your first diagnosis.'}
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Diagnosis
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogTitle>Create New Diagnosis</DialogTitle>
                  <CreateDiagnosisDialog
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          filteredDiagnoses.map((diagnosis) => (
            <Card
              key={diagnosis.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedDiagnosis(diagnosis)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{diagnosis.description}</CardTitle>
                      {!diagnosis.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {diagnosis.icd10Code && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 mr-1" />
                        ICD-10: {diagnosis.icd10Code}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {diagnosis.patient.firstName} {diagnosis.patient.lastName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(diagnosis.diagnosedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={diagnosisTypeBadgeColors[diagnosis.type]}>
                      {diagnosisTypeLabels[diagnosis.type]}
                    </Badge>
                    {diagnosis.severity && (
                      <Badge variant="outline">{diagnosis.severity}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diagnosis.notes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notes:</p>
                      <p className="text-sm line-clamp-2">{diagnosis.notes}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Medical Record: {diagnosis.medicalRecord.title}</span>
                    {diagnosis.resolvedAt ? (
                      <span>Resolved: {formatDate(diagnosis.resolvedAt)}</span>
                    ) : (
                      <span>Created: {formatDateTime(diagnosis.createdAt)}</span>
                    )}
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

      {/* Diagnosis Details Dialog */}
      <Dialog open={!!selectedDiagnosis} onOpenChange={() => setSelectedDiagnosis(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">
            Diagnosis Details
          </DialogTitle>
          {selectedDiagnosis && (
            <DiagnosisDetails
              diagnosis={selectedDiagnosis}
              onClose={() => setSelectedDiagnosis(null)}
              onUpdate={fetchDiagnoses}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}