export enum Specialization {
  GENERAL_MEDICINE = 'GENERAL_MEDICINE',
  CARDIOLOGY = 'CARDIOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  PEDIATRICS = 'PEDIATRICS',
  GYNECOLOGY = 'GYNECOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  PSYCHIATRY = 'PSYCHIATRY',
  RADIOLOGY = 'RADIOLOGY',
  ANESTHESIOLOGY = 'ANESTHESIOLOGY',
  EMERGENCY_MEDICINE = 'EMERGENCY_MEDICINE',
  SURGERY = 'SURGERY',
}

export enum DoctorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  specialization: Specialization;
  phone: string;
  email: string;
  licenseNumber: string;
  experienceYears: number;
  schedule: string | null;
  consultationFee: string;
  status: DoctorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDoctorData {
  name: string;
  specialization: Specialization;
  phone: string;
  email: string;
  licenseNumber: string;
  experienceYears?: number;
  schedule?: string;
  consultationFee?: string;
  status?: DoctorStatus;
}

export interface UpdateDoctorData extends Partial<CreateDoctorData> {}

export interface DoctorQuery {
  search?: string;
  specialization?: Specialization;
  status?: DoctorStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorListResponse {
  data: Doctor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const specializationLabels: Record<Specialization, string> = {
  [Specialization.GENERAL_MEDICINE]: 'General Medicine',
  [Specialization.CARDIOLOGY]: 'Cardiology',
  [Specialization.NEUROLOGY]: 'Neurology',
  [Specialization.ORTHOPEDICS]: 'Orthopedics',
  [Specialization.PEDIATRICS]: 'Pediatrics',
  [Specialization.GYNECOLOGY]: 'Gynecology',
  [Specialization.DERMATOLOGY]: 'Dermatology',
  [Specialization.PSYCHIATRY]: 'Psychiatry',
  [Specialization.RADIOLOGY]: 'Radiology',
  [Specialization.ANESTHESIOLOGY]: 'Anesthesiology',
  [Specialization.EMERGENCY_MEDICINE]: 'Emergency Medicine',
  [Specialization.SURGERY]: 'Surgery',
};

export const statusLabels: Record<DoctorStatus, string> = {
  [DoctorStatus.ACTIVE]: 'Active',
  [DoctorStatus.INACTIVE]: 'Inactive',
  [DoctorStatus.ON_LEAVE]: 'On Leave',
};