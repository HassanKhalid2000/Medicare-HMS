'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  medicalReportsService,
  MedicalReport,
  CreateReportDto,
  UpdateReportDto,
  ReportType,
  ReportFormat,
  getReportTypeLabel,
  getReportFormatLabel,
} from '@/services/medical-reports';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ReportFormProps {
  report?: MedicalReport | null;
  onSuccess: (report: MedicalReport) => void;
  onCancel: () => void;
}

export function ReportForm({ report, onSuccess, onCancel }: ReportFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: report?.title || '',
    description: report?.description || '',
    type: report?.type || ReportType.PATIENT_SUMMARY,
    format: report?.format || ReportFormat.PDF,
    startDate: '',
    endDate: '',
    patientId: '',
    doctorId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      const filters: any = {};
      if (formData.startDate) filters.startDate = formData.startDate;
      if (formData.endDate) filters.endDate = formData.endDate;
      if (formData.patientId) filters.patientId = formData.patientId;
      if (formData.doctorId) filters.doctorId = formData.doctorId;

      if (report) {
        const updateData: UpdateReportDto = {
          title: formData.title,
          description: formData.description || undefined,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        };

        const response = await medicalReportsService.updateReport(report.id, updateData);
        toast.success('Report updated successfully');
        onSuccess(response.data);
      } else {
        const createData: CreateReportDto = {
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          format: formData.format,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        };

        const response = await medicalReportsService.createReport(createData);
        toast.success('Report created successfully');
        onSuccess(response.data);
      }
    } catch (error: any) {
      console.error('Failed to save report:', error);
      toast.error(error.response?.data?.message || 'Failed to save report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Report Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={isLoading}
          required
          placeholder="e.g., Monthly Patient Summary Report"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          rows={2}
          placeholder="Optional description of the report"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Report Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as ReportType })}
            disabled={isLoading || !!report}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ReportType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getReportTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="format">Format *</Label>
          <Select
            value={formData.format}
            onValueChange={(value) => setFormData({ ...formData, format: value as ReportFormat })}
            disabled={isLoading || !!report}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ReportFormat).map((format) => (
                <SelectItem key={format} value={format}>
                  {getReportFormatLabel(format)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">Filters (Optional)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              disabled={isLoading}
              placeholder="Filter by specific patient"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorId">Doctor ID</Label>
            <Input
              id="doctorId"
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              disabled={isLoading}
              placeholder="Filter by specific doctor"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {report ? 'Update Report' : 'Generate Report'}
        </Button>
      </div>
    </form>
  );
}
