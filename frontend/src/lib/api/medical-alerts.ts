import api from './base';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface MedicalAlert {
  id: string;
  patientId: string;
  alertType: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  isActive: boolean;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  acknowledgedByUser?: {
    id: string;
    fullName: string;
  };
}

export interface CreateMedicalAlertDto {
  patientId: string;
  alertType: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  isActive?: boolean;
  expiresAt?: string;
}

export interface UpdateMedicalAlertDto {
  alertType?: string;
  title?: string;
  message?: string;
  severity?: AlertSeverity;
  isActive?: boolean;
  expiresAt?: string;
}

export interface MedicalAlertQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  patientId?: string;
  alertType?: string;
  severity?: AlertSeverity;
  isActive?: boolean;
  isAcknowledged?: boolean;
}

export interface AlertStatistics {
  total: number;
  active: number;
  acknowledged: number;
  bySeverity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  byType: Record<string, number>;
  recentAlerts: MedicalAlert[];
}

export const medicalAlertsApi = {
  getAll: async (params?: MedicalAlertQueryParams) => {
    const response = await api.get<{
      data: MedicalAlert[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/medical-alerts', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<MedicalAlert>(`/medical-alerts/${id}`);
    return response.data;
  },

  getByPatient: async (patientId: string) => {
    const response = await api.get<MedicalAlert[]>(
      `/medical-alerts/patient/${patientId}`
    );
    return response.data;
  },

  getCritical: async () => {
    const response = await api.get<MedicalAlert[]>('/medical-alerts/critical');
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get<AlertStatistics>('/medical-alerts/statistics');
    return response.data;
  },

  create: async (data: CreateMedicalAlertDto) => {
    const response = await api.post<MedicalAlert>('/medical-alerts', data);
    return response.data;
  },

  update: async (id: string, data: UpdateMedicalAlertDto) => {
    const response = await api.patch<MedicalAlert>(`/medical-alerts/${id}`, data);
    return response.data;
  },

  acknowledge: async (id: string) => {
    const response = await api.patch<MedicalAlert>(
      `/medical-alerts/${id}/acknowledge`
    );
    return response.data;
  },

  deactivate: async (id: string) => {
    const response = await api.patch<MedicalAlert>(
      `/medical-alerts/${id}/deactivate`
    );
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/medical-alerts/${id}`);
  },
};
