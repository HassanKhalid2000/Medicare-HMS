import { api } from './api';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentQuery,
  AppointmentListResponse
} from '@/types/appointment';

export const appointmentsService = {
  // Get all appointments with filtering and pagination
  async getAppointments(query: AppointmentQuery = {}): Promise<AppointmentListResponse> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;

    return api.get<AppointmentListResponse>(endpoint);
  },

  // Get a single appointment by ID
  async getAppointment(id: string): Promise<Appointment> {
    return api.get<Appointment>(`/appointments/${id}`);
  },

  // Create a new appointment
  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    return api.post<Appointment>('/appointments', data);
  },

  // Update an existing appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    return api.patch<Appointment>(`/appointments/${id}`, data);
  },

  // Delete/cancel an appointment
  async deleteAppointment(id: string): Promise<void> {
    return api.delete<void>(`/appointments/${id}`);
  },

  // Get appointment statistics
  async getAppointmentStatistics(): Promise<{
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    byType: Record<string, number>;
    byDoctor: Record<string, number>;
  }> {
    return api.get<{
      total: number;
      scheduled: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      byType: Record<string, number>;
      byDoctor: Record<string, number>;
    }>('/appointments/statistics');
  },

  // Get available time slots for a doctor on a specific date
  async getAvailableTimeSlots(doctorId: string, date: string): Promise<{
    slots: Array<{
      time: string;
      available: boolean;
      appointmentId?: string;
    }>;
  }> {
    return api.get<{
      slots: Array<{
        time: string;
        available: boolean;
        appointmentId?: string;
      }>;
    }>(`/appointments/available-slots/${doctorId}/${date}`);
  },
};