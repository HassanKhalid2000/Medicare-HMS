import { api } from './base';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: 'consultation' | 'follow_up' | 'emergency' | 'check_up';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  symptoms?: string[];
  vitalSigns?: any;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  followUpDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  patient?: any;
  doctor?: any;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration?: number;
  type: 'consultation' | 'follow_up' | 'emergency' | 'check_up';
  reason: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  symptoms?: string[];
  vitalSigns?: any;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  followUpDate?: string;
}

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  patientId?: string;
  doctorId?: string;
  status?: string;
  type?: string;
  date?: string;
  priority?: string;
}

export interface AppointmentResponse {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

export const appointmentsApi = {
  // Get all appointments with filtering and pagination
  getAll: async (params?: AppointmentListParams): Promise<AppointmentResponse> => {
    const searchParams = new URLSearchParams();

    // Set default pagination values if not provided
    const page = params?.page || 1;
    const limit = params?.limit || 10;

    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    if (params?.search) searchParams.append('search', params.search);
    if (params?.patientId) searchParams.append('patientId', params.patientId);
    if (params?.doctorId) searchParams.append('doctorId', params.doctorId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.date) searchParams.append('date', params.date);
    if (params?.priority) searchParams.append('priority', params.priority);

    const response = await api.get(`/appointments?${searchParams.toString()}`);
    return response.data;
  },

  // Get appointment by ID
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Create new appointment
  create: async (data: CreateAppointmentDto): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // Update appointment
  update: async (id: string, data: UpdateAppointmentDto): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data;
  },

  // Delete appointment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  // Get available slots for a doctor on a specific date
  getAvailableSlots: async (doctorId: string, date: string): Promise<AvailableSlot[]> => {
    const response = await api.get(`/appointments/available-slots/${doctorId}/${date}`);
    return response.data;
  },

  // Get appointment statistics
  getStatistics: async (): Promise<any> => {
    const response = await api.get('/appointments/statistics');
    return response.data;
  },
};