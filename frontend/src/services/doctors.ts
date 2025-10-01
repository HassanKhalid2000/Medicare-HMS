import { api } from './api';
import {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  DoctorQuery,
  DoctorListResponse
} from '@/types/doctor';

export const doctorsService = {
  // Get all doctors with filtering and pagination
  async getDoctors(query: DoctorQuery = {}): Promise<DoctorListResponse> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/doctors${queryString ? `?${queryString}` : ''}`;

    return api.get<DoctorListResponse>(endpoint);
  },

  // Get a single doctor by ID
  async getDoctor(id: string): Promise<Doctor> {
    return api.get<Doctor>(`/doctors/${id}`);
  },

  // Create a new doctor
  async createDoctor(data: CreateDoctorData): Promise<Doctor> {
    return api.post<Doctor>('/doctors', data);
  },

  // Update an existing doctor
  async updateDoctor(id: string, data: UpdateDoctorData): Promise<Doctor> {
    return api.patch<Doctor>(`/doctors/${id}`, data);
  },

  // Delete a doctor
  async deleteDoctor(id: string): Promise<void> {
    return api.delete<void>(`/doctors/${id}`);
  },

  // Get doctor statistics
  async getDoctorStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    bySpecialization: Record<string, number>;
  }> {
    return api.get<{
      total: number;
      active: number;
      inactive: number;
      onLeave: number;
      bySpecialization: Record<string, number>;
    }>('/doctors/statistics');
  },
};