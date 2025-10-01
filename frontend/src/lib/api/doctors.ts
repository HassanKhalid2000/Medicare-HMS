import { api } from './base';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  availability: string[];
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  qualifications?: string[];
  experience: number;
  consultationFee: number;
  availability?: string[];
}

export interface UpdateDoctorDto extends Partial<CreateDoctorDto> {
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  availability?: string;
}

export interface DoctorResponse {
  data: Doctor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const doctorsApi = {
  // Get all doctors with filtering and pagination
  getAll: async (params?: DoctorListParams): Promise<DoctorResponse> => {
    const searchParams = new URLSearchParams();

    // Set default pagination values if not provided
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    if (params?.search) searchParams.append('search', params.search);
    if (params?.specialization) searchParams.append('specialization', params.specialization);
    if (params?.department) searchParams.append('department', params.department);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.availability) searchParams.append('availability', params.availability);

    const response = await api.get(`/doctors?${searchParams.toString()}`);
    return response.data;
  },

  // Get doctor by ID
  getById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  // Create new doctor
  create: async (data: CreateDoctorDto): Promise<Doctor> => {
    const response = await api.post('/doctors', data);
    return response.data;
  },

  // Update doctor
  update: async (id: string, data: UpdateDoctorDto): Promise<Doctor> => {
    const response = await api.patch(`/doctors/${id}`, data);
    return response.data;
  },

  // Delete doctor
  delete: async (id: string): Promise<void> => {
    await api.delete(`/doctors/${id}`);
  },

  // Get doctor statistics
  getStatistics: async (): Promise<any> => {
    const response = await api.get('/doctors/statistics');
    return response.data;
  },

  // Search doctors
  search: async (query: string): Promise<Doctor[]> => {
    const response = await api.get(`/doctors?search=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};