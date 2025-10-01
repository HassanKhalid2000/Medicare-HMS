import { ApiResponse, PaginatedResponse } from './types';
import { api } from './base';

export interface Diagnosis {
  id: string;
  patientId: string;
  medicalRecordId: string;
  icd10Code?: string;
  description: string;
  type: 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL' | 'PROVISIONAL' | 'FINAL';
  notes?: string;
  diagnosedAt: string;
  resolvedAt?: string;
  isActive: boolean;
  severity?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  medicalRecord: {
    id: string;
    title: string;
    recordType: string;
    createdAt: string;
    doctor?: {
      id: string;
      name: string;
      specialization: string;
    };
  };
}

export interface ICD10Code {
  code: string;
  description: string;
  display: string;
}

export interface CreateDiagnosisDto {
  medicalRecordId: string;
  icd10Code?: string;
  description: string;
  type: Diagnosis['type'];
  notes?: string;
  diagnosedAt?: string;
  severity?: string;
}

export interface UpdateDiagnosisDto extends Partial<CreateDiagnosisDto> {
  isActive?: boolean;
}

export interface DiagnosisFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  medicalRecordId?: string;
  type?: string;
  isActive?: boolean;
  search?: string;
}

class DiagnosesApi {

  async getDiagnoses(filters: DiagnosisFilters = {}): Promise<PaginatedResponse<Diagnosis>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/diagnoses?${queryString}` : '/diagnoses';

    const response = await api.get(endpoint);
    return response.data;
  }

  async getDiagnosis(id: string): Promise<Diagnosis> {
    const response = await api.get(`/diagnoses/${id}`);
    return response.data;
  }

  async getDiagnosesByMedicalRecord(medicalRecordId: string): Promise<Diagnosis[]> {
    const response = await api.get(`/diagnoses/medical-record/${medicalRecordId}`);
    return response.data;
  }

  async getPatientDiagnoses(
    patientId: string,
    filters: { page?: number; limit?: number; type?: string; isActive?: boolean } = {}
  ): Promise<PaginatedResponse<Diagnosis>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/diagnoses/patient/${patientId}?${queryString}`
      : `/diagnoses/patient/${patientId}`;

    const response = await api.get(endpoint);
    return response.data;
  }

  async searchICD10Codes(query: string, limit?: number): Promise<ICD10Code[]> {
    const params = new URLSearchParams({ query });
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await api.get(`/diagnoses/icd10/search?${params.toString()}`);
    return response.data;
  }

  async createDiagnosis(data: CreateDiagnosisDto): Promise<Diagnosis> {
    const response = await api.post('/diagnoses', data);
    return response.data;
  }

  async updateDiagnosis(id: string, data: UpdateDiagnosisDto): Promise<Diagnosis> {
    const response = await api.patch(`/diagnoses/${id}`, data);
    return response.data;
  }

  async resolveDiagnosis(id: string): Promise<Diagnosis> {
    const response = await api.patch(`/diagnoses/${id}/resolve`);
    return response.data;
  }

  async activateDiagnosis(id: string): Promise<Diagnosis> {
    const response = await api.patch(`/diagnoses/${id}/activate`);
    return response.data;
  }

  async deactivateDiagnosis(id: string): Promise<Diagnosis> {
    const response = await api.patch(`/diagnoses/${id}/deactivate`);
    return response.data;
  }

  async deleteDiagnosis(id: string): Promise<void> {
    await api.delete(`/diagnoses/${id}`);
  }
}

export const diagnosesApi = new DiagnosesApi();