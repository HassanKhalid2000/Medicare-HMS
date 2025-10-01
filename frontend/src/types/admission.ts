export enum Ward {
  GENERAL = 'General',
  ICU = 'ICU',
  CCU = 'CCU',
  PEDIATRIC = 'Pediatric',
  MATERNITY = 'Maternity',
  SURGICAL = 'Surgical',
  EMERGENCY = 'Emergency',
}

export enum AdmissionType {
  EMERGENCY = 'emergency',
  PLANNED = 'planned',
  TRANSFER = 'transfer',
}

export enum AdmissionStatus {
  ADMITTED = 'admitted',
  DISCHARGED = 'discharged',
  TRANSFERRED = 'transferred',
}

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  allergyNotes?: string;
  medicalHistory?: string;
}

export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  experienceYears?: number;
}

export interface Admission {
  id: string;
  patientId: string;
  doctorId: string;
  ward: Ward;
  roomNumber?: string;
  bedNumber?: string;
  admissionDate: Date;
  dischargeDate?: Date;
  admissionType: AdmissionType;
  reason?: string;
  status: AdmissionStatus;
  notes?: string;
  dischargeSummary?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  doctor?: Doctor;
}

export interface CreateAdmissionData {
  patientId: string;
  doctorId: string;
  ward: Ward;
  roomNumber?: string;
  bedNumber?: string;
  admissionDate: string; // YYYY-MM-DD format
  admissionType: AdmissionType;
  reason?: string;
  notes?: string;
}

export interface UpdateAdmissionData extends Partial<CreateAdmissionData> {
  dischargeDate?: string; // YYYY-MM-DD format
  status?: AdmissionStatus;
  dischargeSummary?: string;
}

export interface AdmissionQuery {
  search?: string;
  patientId?: string;
  doctorId?: string;
  status?: AdmissionStatus;
  admissionType?: AdmissionType;
  ward?: Ward;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdmissionListResponse {
  data: Admission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdmissionStatistics {
  totalAdmissions: number;
  activeAdmissions: number;
  admissionsToday: number;
  admissionsThisMonth: number;
  dischargedThisMonth: number;
}

export interface WardStatistics {
  ward: Ward;
  count: number;
}

export const wardLabels: Record<Ward, string> = {
  [Ward.GENERAL]: 'General Ward',
  [Ward.ICU]: 'Intensive Care Unit',
  [Ward.CCU]: 'Cardiac Care Unit',
  [Ward.PEDIATRIC]: 'Pediatric Ward',
  [Ward.MATERNITY]: 'Maternity Ward',
  [Ward.SURGICAL]: 'Surgical Ward',
  [Ward.EMERGENCY]: 'Emergency Ward',
};

export const admissionTypeLabels: Record<AdmissionType, string> = {
  [AdmissionType.EMERGENCY]: 'Emergency',
  [AdmissionType.PLANNED]: 'Planned',
  [AdmissionType.TRANSFER]: 'Transfer',
};

export const admissionStatusLabels: Record<AdmissionStatus, string> = {
  [AdmissionStatus.ADMITTED]: 'Admitted',
  [AdmissionStatus.DISCHARGED]: 'Discharged',
  [AdmissionStatus.TRANSFERRED]: 'Transferred',
};

export const admissionStatusColors: Record<AdmissionStatus, string> = {
  [AdmissionStatus.ADMITTED]: 'bg-blue-100 text-blue-800',
  [AdmissionStatus.DISCHARGED]: 'bg-green-100 text-green-800',
  [AdmissionStatus.TRANSFERRED]: 'bg-yellow-100 text-yellow-800',
};

export const wardColors: Record<Ward, string> = {
  [Ward.GENERAL]: 'bg-gray-100 text-gray-800',
  [Ward.ICU]: 'bg-red-100 text-red-800',
  [Ward.CCU]: 'bg-orange-100 text-orange-800',
  [Ward.PEDIATRIC]: 'bg-pink-100 text-pink-800',
  [Ward.MATERNITY]: 'bg-purple-100 text-purple-800',
  [Ward.SURGICAL]: 'bg-blue-100 text-blue-800',
  [Ward.EMERGENCY]: 'bg-yellow-100 text-yellow-800',
};