import { api } from './api';

export enum TestType {
  BLOOD_TEST = 'BLOOD_TEST',
  URINE_TEST = 'URINE_TEST',
  X_RAY = 'X_RAY',
  CT_SCAN = 'CT_SCAN',
  MRI = 'MRI',
  ECG = 'ECG',
  ULTRASOUND = 'ULTRASOUND',
  BIOPSY = 'BIOPSY',
}

export enum TestUrgency {
  routine = 'routine',
  urgent = 'urgent',
  stat = 'stat',
}

export enum TestStatus {
  requested = 'requested',
  sample_collected = 'sample_collected',
  processing = 'processing',
  completed = 'completed',
  cancelled = 'cancelled',
  failed = 'failed',
  on_hold = 'on_hold',
}

export interface LabTest {
  id: string;
  testNumber: string;
  patientId: string;
  doctorId: string;
  testType: TestType;
  urgency: TestUrgency;
  status: TestStatus;
  sampleInfo?: string;
  results?: string;
  normalRanges?: string;
  technician?: string;
  cost?: string;
  requestedAt: string;
  collectedAt?: string;
  completedAt?: string;
  reportUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    patientId: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    phone?: string;
  };
  doctor?: {
    doctorId: string;
    name: string;
    specialization: string;
  };
  labPanels?: Array<{
    id: string;
    panel: {
      id: string;
      name: string;
      category: string;
    };
  }>;
  labResults?: Array<{
    id: string;
    value: string;
    unit: string;
    referenceRange?: string;
    status: string;
    interpretation: string;
    parameter: {
      id: string;
      name: string;
      code: string;
      unit: string;
    };
  }>;
  _count?: {
    labResults: number;
  };
}

export interface LabTestQuery {
  search?: string;
  patientId?: string;
  doctorId?: string;
  testType?: TestType;
  status?: TestStatus;
  urgency?: TestUrgency;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateLabTestDto {
  patientId: string;
  doctorId: string;
  testType: TestType;
  urgency?: TestUrgency;
  sampleInfo?: string;
  cost?: string;
  notes?: string;
  panelIds?: string[];
}

export interface UpdateLabTestDto {
  patientId?: string;
  doctorId?: string;
  testType?: TestType;
  urgency?: TestUrgency;
  status?: TestStatus;
  sampleInfo?: string;
  results?: string;
  normalRanges?: string;
  technician?: string;
  cost?: string;
  collectedAt?: Date;
  completedAt?: Date;
  reportUrl?: string;
  notes?: string;
}

export interface LabTestStatistics {
  total: number;
  requested: number;
  processing: number;
  completed: number;
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
}

export const laboratoryService = {
  async getLabTests(query: LabTestQuery = {}): Promise<{ data: LabTest[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/laboratory?${params.toString()}`);
  },

  async getLabTest(id: string): Promise<LabTest> {
    return api.get(`/laboratory/${id}`);
  },

  async createLabTest(data: CreateLabTestDto): Promise<LabTest> {
    return api.post('/laboratory', data);
  },

  async updateLabTest(id: string, data: UpdateLabTestDto): Promise<LabTest> {
    return api.patch(`/laboratory/${id}`, data);
  },

  async deleteLabTest(id: string): Promise<void> {
    return api.delete(`/laboratory/${id}`);
  },

  async getStatistics(): Promise<LabTestStatistics> {
    return api.get('/laboratory/statistics');
  },
};
