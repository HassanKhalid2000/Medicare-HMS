import { api } from './api';

export enum ReportType {
  PATIENT_SUMMARY = 'PATIENT_SUMMARY',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  PRESCRIPTION_REPORT = 'PRESCRIPTION_REPORT',
  VITAL_SIGNS_REPORT = 'VITAL_SIGNS_REPORT',
  LAB_RESULTS_REPORT = 'LAB_RESULTS_REPORT',
  ADMISSION_REPORT = 'ADMISSION_REPORT',
  FINANCIAL_REPORT = 'FINANCIAL_REPORT',
  APPOINTMENT_REPORT = 'APPOINTMENT_REPORT',
  DIAGNOSIS_REPORT = 'DIAGNOSIS_REPORT',
  CUSTOM_REPORT = 'CUSTOM_REPORT',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

export interface MedicalReport {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  parameters?: Record<string, any>;
  filters?: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    doctorId?: string;
    departmentId?: string;
    [key: string]: any;
  };
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  requestedBy: string;
  generatedBy?: string;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  requestedByUser?: {
    fullName: string;
    email: string;
  };
  generatedByUser?: {
    fullName: string;
    email: string;
  };
}

export interface ReportQuery {
  type?: ReportType;
  status?: ReportStatus;
  format?: ReportFormat;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateReportDto {
  title: string;
  description?: string;
  type: ReportType;
  format?: ReportFormat;
  parameters?: Record<string, any>;
  filters?: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    doctorId?: string;
    departmentId?: string;
    [key: string]: any;
  };
  expiresAt?: string;
}

export interface UpdateReportDto {
  title?: string;
  description?: string;
  status?: ReportStatus;
  filters?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface ReportStatistics {
  total: number;
  byStatus: Array<{
    status: ReportStatus;
    count: number;
  }>;
  byType: Array<{
    type: ReportType;
    count: number;
  }>;
  byFormat: Array<{
    format: ReportFormat;
    count: number;
  }>;
}

export const medicalReportsService = {
  async getReports(query: ReportQuery = {}): Promise<{
    success: boolean;
    data: MedicalReport[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    message: string;
  }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/medical-reports?${params.toString()}`);
  },

  async getReport(id: string): Promise<{ success: boolean; data: MedicalReport; message: string }> {
    return api.get(`/medical-reports/${id}`);
  },

  async createReport(data: CreateReportDto): Promise<{ success: boolean; data: MedicalReport; message: string }> {
    return api.post('/medical-reports', data);
  },

  async updateReport(id: string, data: UpdateReportDto): Promise<{ success: boolean; data: MedicalReport; message: string }> {
    return api.patch(`/medical-reports/${id}`, data);
  },

  async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/medical-reports/${id}`);
  },

  async downloadReport(id: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/medical-reports/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download report');
    }

    return response.blob();
  },

  async getStatistics(): Promise<{ success: boolean; data: ReportStatistics; message: string }> {
    return api.get('/medical-reports/stats/summary');
  },
};

export const getReportTypeLabel = (type: ReportType): string => {
  const labels: Record<ReportType, string> = {
    [ReportType.PATIENT_SUMMARY]: 'Patient Summary',
    [ReportType.MEDICAL_HISTORY]: 'Medical History',
    [ReportType.PRESCRIPTION_REPORT]: 'Prescription Report',
    [ReportType.VITAL_SIGNS_REPORT]: 'Vital Signs Report',
    [ReportType.LAB_RESULTS_REPORT]: 'Lab Results Report',
    [ReportType.ADMISSION_REPORT]: 'Admission Report',
    [ReportType.FINANCIAL_REPORT]: 'Financial Report',
    [ReportType.APPOINTMENT_REPORT]: 'Appointment Report',
    [ReportType.DIAGNOSIS_REPORT]: 'Diagnosis Report',
    [ReportType.CUSTOM_REPORT]: 'Custom Report',
  };
  return labels[type];
};

export const getReportStatusLabel = (status: ReportStatus): string => {
  const labels: Record<ReportStatus, string> = {
    [ReportStatus.PENDING]: 'Pending',
    [ReportStatus.GENERATING]: 'Generating',
    [ReportStatus.COMPLETED]: 'Completed',
    [ReportStatus.FAILED]: 'Failed',
    [ReportStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status];
};

export const getReportFormatLabel = (format: ReportFormat): string => {
  const labels: Record<ReportFormat, string> = {
    [ReportFormat.PDF]: 'PDF',
    [ReportFormat.CSV]: 'CSV',
    [ReportFormat.EXCEL]: 'Excel',
    [ReportFormat.JSON]: 'JSON',
  };
  return labels[format];
};
