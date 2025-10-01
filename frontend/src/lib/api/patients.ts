import { api } from './base';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string;
  allergies: string[];
  medicalHistory: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string[];
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  status?: 'active' | 'inactive';
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
}

export interface PatientResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const patientsApi = {
  // Get all patients with filtering and pagination
  getAll: async (params?: PatientListParams): Promise<PatientResponse> => {
    const searchParams = new URLSearchParams();

    // Set default pagination values if not provided
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.gender) searchParams.append('gender', params.gender);
    if (params?.bloodType) searchParams.append('bloodType', params.bloodType);

    const response = await api.get(`/patients?${searchParams.toString()}`);
    return response.data;
  },

  // Get patient by ID
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Create new patient
  create: async (data: CreatePatientDto): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  // Update patient
  update: async (id: string, data: UpdatePatientDto): Promise<Patient> => {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  },

  // Delete patient
  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  // Get patient appointments
  getAppointments: async (id: string): Promise<any[]> => {
    const response = await api.get(`/patients/${id}/appointments`);
    return response.data;
  },

  // Search patients
  search: async (query: string): Promise<Patient[]> => {
    const response = await api.get(`/patients?search=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};