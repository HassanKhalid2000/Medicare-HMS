import { ApiResponse, PaginatedResponse } from './types';
import { api } from './base';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  dosageInfo: string;
  sideEffects: string;
  interactions: string;
}

export interface DrugInteraction {
  medicine1: Medicine;
  medicine2: Medicine;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CONTRAINDICATED';
  description: string;
  recommendation: string;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions?: string;
  warnings?: string;
  isActive: boolean;
  prescribedAt: string;
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
  medicalRecord: {
    id: string;
    title: string;
    recordType: string;
    createdAt: string;
    patient: {
      id: string;
      patientId: string;
      firstName: string;
      lastName: string;
    };
    doctor?: {
      id: string;
      name: string;
      specialization: string;
    };
  };
}

export interface CreatePrescriptionDto {
  medicalRecordId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions?: string;
  warnings?: string;
  prescribedAt?: string;
  isActive?: boolean;
}

export interface UpdatePrescriptionDto extends Partial<CreatePrescriptionDto> {}

export interface PrescriptionFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  medicalRecordId?: string;
  isActive?: boolean;
  search?: string;
}

class PrescriptionsApi {

  async getPrescriptions(filters: PrescriptionFilters = {}): Promise<PaginatedResponse<Prescription>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/prescriptions?${queryString}` : '/prescriptions';

    const response = await api.get(endpoint);
    return response.data;
  }

  async getPrescription(id: string): Promise<Prescription> {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  }

  async getPrescriptionsByMedicalRecord(medicalRecordId: string): Promise<Prescription[]> {
    const response = await api.get(`/prescriptions/medical-record/${medicalRecordId}`);
    return response.data;
  }

  async getPatientPrescriptions(
    patientId: string,
    filters: { page?: number; limit?: number; isActive?: boolean } = {}
  ): Promise<PaginatedResponse<Prescription>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/prescriptions/patient/${patientId}?${queryString}`
      : `/prescriptions/patient/${patientId}`;

    const response = await api.get(endpoint);
    return response.data;
  }

  async searchMedicines(query: string, limit?: number): Promise<Medicine[]> {
    const params = new URLSearchParams({ query });
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await api.get(`/prescriptions/medicines/search?${params.toString()}`);
    return response.data;
  }

  async checkDrugInteractions(medicineIds: string[]): Promise<DrugInteraction[]> {
    const response = await api.post('/prescriptions/check-interactions', { medicineIds });
    return response.data;
  }

  async createPrescription(data: CreatePrescriptionDto): Promise<Prescription> {
    const response = await api.post('/prescriptions', data);
    return response.data;
  }

  async updatePrescription(id: string, data: UpdatePrescriptionDto): Promise<Prescription> {
    const response = await api.patch(`/prescriptions/${id}`, data);
    return response.data;
  }

  async activatePrescription(id: string): Promise<Prescription> {
    const response = await api.patch(`/prescriptions/${id}/activate`);
    return response.data;
  }

  async deactivatePrescription(id: string): Promise<Prescription> {
    const response = await api.patch(`/prescriptions/${id}/deactivate`);
    return response.data;
  }

  async dispensePrescription(id: string): Promise<Prescription> {
    const response = await api.patch(`/prescriptions/${id}/dispense`);
    return response.data;
  }

  async deletePrescription(id: string): Promise<void> {
    await api.delete(`/prescriptions/${id}`);
  }
}

export const prescriptionsApi = new PrescriptionsApi();