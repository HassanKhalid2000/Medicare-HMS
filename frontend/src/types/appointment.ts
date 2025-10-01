export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  ROUTINE_CHECKUP = 'routine_checkup',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  specialization: string;
  consultationFee: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: Date;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  symptoms: string | null;
  diagnosis: string | null;
  prescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  doctor?: Doctor;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // Changed to string format "YYYY-MM-DD"
  appointmentTime: string; // Changed to string format "HH:MM"
  duration?: number;
  type: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  symptoms?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
  diagnosis?: string;
  prescription?: string;
}

export interface AppointmentQuery {
  search?: string;
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentListResponse {
  data: Appointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  [AppointmentType.CONSULTATION]: 'Consultation',
  [AppointmentType.FOLLOW_UP]: 'Follow-up',
  [AppointmentType.EMERGENCY]: 'Emergency',
  [AppointmentType.ROUTINE_CHECKUP]: 'Routine Checkup',
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Scheduled',
  [AppointmentStatus.CONFIRMED]: 'Confirmed',
  [AppointmentStatus.COMPLETED]: 'Completed',
  [AppointmentStatus.CANCELLED]: 'Cancelled',
  [AppointmentStatus.NO_SHOW]: 'No Show',
};

export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-800',
  [AppointmentStatus.COMPLETED]: 'bg-gray-100 text-gray-800',
  [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [AppointmentStatus.NO_SHOW]: 'bg-orange-100 text-orange-800',
};

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  patient: string;
  doctor: string;
}