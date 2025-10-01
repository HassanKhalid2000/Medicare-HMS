import { api } from '@/lib/api/base';
import {
  Admission,
  AdmissionListResponse,
  AdmissionQuery,
  CreateAdmissionData,
  UpdateAdmissionData,
  AdmissionStatistics,
  WardStatistics,
} from '@/types/admission';

class AdmissionsService {
  private baseUrl = '/admissions';

  async getAdmissions(query: AdmissionQuery = {}): Promise<AdmissionListResponse> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getAdmission(id: string): Promise<Admission> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createAdmission(data: CreateAdmissionData): Promise<Admission> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async updateAdmission(id: string, data: UpdateAdmissionData): Promise<Admission> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async dischargePatient(id: string, dischargeSummary?: string): Promise<Admission> {
    const response = await api.put(`${this.baseUrl}/${id}/discharge`, {
      dischargeSummary,
    });
    return response.data;
  }

  async deleteAdmission(id: string): Promise<Admission> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getStatistics(): Promise<AdmissionStatistics> {
    const response = await api.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async getWardStatistics(): Promise<WardStatistics[]> {
    const response = await api.get(`${this.baseUrl}/ward-statistics`);
    return response.data;
  }

  // Search patients for admission
  async searchPatients(query: string) {
    const response = await api.get(`/patients?search=${encodeURIComponent(query)}&limit=10`);
    return response.data.data;
  }

  // Search doctors for admission
  async searchDoctors(query: string) {
    const response = await api.get(`/doctors?search=${encodeURIComponent(query)}&limit=10`);
    return response.data.data;
  }
}

export const admissionsService = new AdmissionsService();