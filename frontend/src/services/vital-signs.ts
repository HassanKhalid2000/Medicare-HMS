import { api } from '@/lib/api/base';
import { VitalSign, CreateVitalSignDto, UpdateVitalSignDto, VitalSignsStatistics, VitalSignType } from '@/types/vital-signs';

export const vitalSignsService = {
  // Create new vital sign record
  async create(data: CreateVitalSignDto): Promise<VitalSign> {
    const response = await api.post('/vital-signs', data);
    return response.data;
  },

  // Get all vital signs with optional filters
  async getAll(filters?: {
    patientId?: string;
    type?: VitalSignType;
    limit?: number;
  }): Promise<VitalSign[]> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/vital-signs?${params.toString()}`);
    return response.data;
  },

  // Get vital sign by ID
  async getById(id: string): Promise<VitalSign> {
    const response = await api.get(`/vital-signs/${id}`);
    return response.data;
  },

  // Update vital sign
  async update(id: string, data: UpdateVitalSignDto): Promise<VitalSign> {
    const response = await api.patch(`/vital-signs/${id}`, data);
    return response.data;
  },

  // Delete vital sign
  async delete(id: string): Promise<void> {
    await api.delete(`/vital-signs/${id}`);
  },

  // Get latest vital signs for a patient
  async getLatestByPatient(patientId: string): Promise<VitalSign[]> {
    const response = await api.get(`/vital-signs/patient/${patientId}/latest`);
    return response.data;
  },

  // Get vital signs history for a patient
  async getPatientHistory(
    patientId: string,
    filters?: {
      type?: VitalSignType;
      days?: number;
    }
  ): Promise<VitalSign[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.days) params.append('days', filters.days.toString());

    const response = await api.get(`/vital-signs/patient/${patientId}/history?${params.toString()}`);
    return response.data;
  },

  // Get vital signs statistics
  async getStatistics(filters?: {
    patientId?: string;
    days?: number;
  }): Promise<VitalSignsStatistics> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.days) params.append('days', filters.days.toString());

    const response = await api.get(`/vital-signs/statistics?${params.toString()}`);
    return response.data;
  },

  // Get abnormal vital signs
  async getAbnormal(filters?: {
    patientId?: string;
    limit?: number;
  }): Promise<VitalSign[]> {
    const params = new URLSearchParams();
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/vital-signs/abnormal?${params.toString()}`);
    return response.data;
  },

  // Search patients for vital signs recording
  async searchPatients(query: string): Promise<Array<{
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
  }>> {
    if (query.length < 2) return [];

    const response = await api.get(`/patients/search?q=${encodeURIComponent(query)}&limit=10`);
    return response.data;
  },
};