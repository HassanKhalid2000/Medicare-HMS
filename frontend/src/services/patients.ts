import { api } from './api';

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth: Date | string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalHistory?: string;
  allergies?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatientQuery {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
  status?: 'active' | 'inactive';
}

export interface UpdatePatientData extends Partial<CreatePatientData> {}

export const patientsService = {
  // Get all patients with filtering
  async getPatients(query: PatientQuery = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return api.get<{
      data: Patient[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/patients?${searchParams.toString()}`);
  },

  // Get single patient by ID
  async getPatient(id: string) {
    return api.get<Patient>(`/patients/${id}`);
  },

  // Get patient statistics
  async getPatientStatistics() {
    return api.get<{
      total: number;
      active: number;
      byGender: Record<string, number>;
      newThisMonth: number;
    }>('/patients/statistics');
  },

  // Create new patient
  async createPatient(data: CreatePatientData) {
    return api.post<Patient>('/patients', data);
  },

  // Update existing patient
  async updatePatient(id: string, data: UpdatePatientData) {
    return api.patch<Patient>(`/patients/${id}`, data);
  },

  // Delete patient
  async deletePatient(id: string) {
    return api.delete(`/patients/${id}`);
  },

  // Get patient appointments
  async getPatientAppointments(id: string) {
    return api.get<{ data: any[]; meta: any }>(`/patients/${id}/appointments`);
  },
};