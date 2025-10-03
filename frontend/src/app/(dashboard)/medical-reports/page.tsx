'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  medicalReportsService,
  MedicalReport,
  ReportType,
  ReportStatus,
  getReportTypeLabel,
  getReportStatusLabel,
  getReportFormatLabel,
} from '@/services/medical-reports';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ReportForm } from '@/components/medical-reports/report-form';
import { ReportPreview } from '@/components/medical-reports/report-preview';

export default function MedicalReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const limit = 10;

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await medicalReportsService.getReports({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        type: typeFilter ? (typeFilter as ReportType) : undefined,
        status: statusFilter ? (statusFilter as ReportStatus) : undefined,
      });
      setReports(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load medical reports');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (report: MedicalReport) => {
    try {
      const response = await medicalReportsService.getReport(report.id);
      setSelectedReport(response.data);
      setShowPreviewDialog(true);
    } catch (error) {
      toast.error('Failed to load report details');
    }
  };

  const handleEdit = (report: MedicalReport) => {
    setSelectedReport(report);
    setIsEditing(true);
    setShowFormDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await medicalReportsService.deleteReport(id);
      toast.success('Report deleted successfully');
      loadReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleDownload = async (report: MedicalReport) => {
    // Show preview dialog which has download/print buttons
    setSelectedReport(report);
    setShowPreviewDialog(true);
  };


  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Medical Reports</h2>
        <p className="text-muted-foreground">Generate and manage medical reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Search and filter medical reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(ReportType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getReportTypeLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(ReportStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {getReportStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setSelectedReport(null); setIsEditing(false); setShowFormDialog(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No reports found</div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge variant="outline">{getReportTypeLabel(report.type)}</Badge>
                      <Badge variant="secondary">{getReportFormatLabel(report.format)}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {report.description && <span>{report.description} • </span>}
                      <span>Requested: {format(new Date(report.requestedAt), 'MMM dd, yyyy HH:mm')}</span>
                      {report.completedAt && (
                        <>
                          {' • '}
                          <span>Completed: {format(new Date(report.completedAt), 'MMM dd, yyyy HH:mm')}</span>
                        </>
                      )}
                      {report.requestedByUser && (
                        <>
                          {' • '}
                          <span>By: {report.requestedByUser.fullName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(report)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(report)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(report.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} reports
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-sm">{selectedReport.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{getReportTypeLabel(selectedReport.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Format</label>
                  <p className="text-sm">{getReportFormatLabel(selectedReport.format)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requested At</label>
                  <p className="text-sm">{format(new Date(selectedReport.requestedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {selectedReport.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Completed At</label>
                    <p className="text-sm">{format(new Date(selectedReport.completedAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                {selectedReport.requestedByUser && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                    <p className="text-sm">{selectedReport.requestedByUser.fullName}</p>
                  </div>
                )}
                {selectedReport.fileName && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">File Name</label>
                    <p className="text-sm">{selectedReport.fileName}</p>
                  </div>
                )}
              </div>
              {selectedReport.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.filters && Object.keys(selectedReport.filters).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Filters</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto">{JSON.stringify(selectedReport.filters, null, 2)}</pre>
                  </div>
                </div>
              )}
              {selectedReport.parameters && Object.keys(selectedReport.parameters).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Parameters</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-auto">{JSON.stringify(selectedReport.parameters, null, 2)}</pre>
                  </div>
                </div>
              )}
              {selectedReport.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-destructive">Error Message</label>
                  <p className="text-sm text-destructive mt-1">{selectedReport.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Report' : 'Generate New Report'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update report information' : 'Create a new medical report'}
            </DialogDescription>
          </DialogHeader>
          <ReportForm
            report={selectedReport}
            onSuccess={(newReport) => {
              setShowFormDialog(false);
              setSelectedReport(newReport);
              setIsEditing(false);
              loadReports();
              // Show preview immediately after creating
              if (!isEditing) {
                setShowPreviewDialog(true);
              }
            }}
            onCancel={() => {
              setShowFormDialog(false);
              setSelectedReport(null);
              setIsEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedReport && <ReportPreview report={selectedReport} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
