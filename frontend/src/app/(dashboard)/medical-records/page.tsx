'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { MedicalRecord, medicalRecordsApi, MedicalRecordFilters } from '@/lib/api/medical-records';
import { formatDate, formatDateTime } from '@/lib/utils';
import CreateMedicalRecordDialog from '@/components/medical-records/CreateMedicalRecordDialog';
import MedicalRecordDetails from '@/components/medical-records/MedicalRecordDetails';

const recordTypeLabels = {
  VISIT_NOTE: 'Visit Note',
  CONSULTATION: 'Consultation',
  DISCHARGE_SUMMARY: 'Discharge Summary',
  PROGRESS_NOTE: 'Progress Note',
  OPERATIVE_REPORT: 'Operative Report',
  DIAGNOSTIC_REPORT: 'Diagnostic Report',
};

const recordTypeBadgeColors = {
  VISIT_NOTE: 'default',
  CONSULTATION: 'secondary',
  DISCHARGE_SUMMARY: 'destructive',
  PROGRESS_NOTE: 'outline',
  OPERATIVE_REPORT: 'secondary',
  DIAGNOSTIC_REPORT: 'default',
} as const;

export default function MedicalRecordsPage() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const filters: MedicalRecordFilters = {
        page: currentPage,
        limit: 10,
        ...(selectedRecordType !== 'all' && { recordType: selectedRecordType }),
      };

      const response = await medicalRecordsApi.getMedicalRecords(filters);
      setMedicalRecords(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, [currentPage, selectedRecordType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    fetchMedicalRecords();
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.title.toLowerCase().includes(searchLower) ||
      record.patient.firstName.toLowerCase().includes(searchLower) ||
      record.patient.lastName.toLowerCase().includes(searchLower) ||
      record.doctor.name.toLowerCase().includes(searchLower) ||
      record.chiefComplaint?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    fetchMedicalRecords();
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
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Manage patient medical records and documentation</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateMedicalRecordDialog
              onSuccess={handleCreateSuccess}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search records, patients, doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <Select value={selectedRecordType} onValueChange={setSelectedRecordType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Record Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(recordTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Medical Records List */}
      <div className="grid gap-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Medical Records Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No records match your search criteria.'
                  : 'Get started by creating your first medical record.'}
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Medical Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <CreateMedicalRecordDialog
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRecord(record)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{record.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {record.patient.firstName} {record.patient.lastName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(record.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={recordTypeBadgeColors[record.recordType]}>
                      {recordTypeLabels[record.recordType]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Dr. {record.doctor.name}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {record.chiefComplaint && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Chief Complaint:</p>
                    <p className="text-sm">{record.chiefComplaint}</p>
                  </div>
                )}
                {record.assessment && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Assessment:</p>
                    <p className="text-sm line-clamp-2">{record.assessment}</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Created: {formatDateTime(record.createdAt)}</span>
                  <span>Updated: {formatDateTime(record.updatedAt)}</span>
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

      {/* Medical Record Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">
            Medical Record Details
          </DialogTitle>
          {selectedRecord && (
            <MedicalRecordDetails
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onUpdate={fetchMedicalRecords}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}