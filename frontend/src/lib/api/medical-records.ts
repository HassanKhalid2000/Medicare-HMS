import { ApiResponse, PaginatedResponse } from './types';
import { api } from './base';

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  recordType: 'VISIT_NOTE' | 'CONSULTATION' | 'DISCHARGE_SUMMARY' | 'PROGRESS_NOTE' | 'OPERATIVE_REPORT' | 'DIAGNOSTIC_REPORT';
  title: string;
  chiefComplaint?: string;
  historyPresent?: string;
  reviewSystems?: string;
  physicalExam?: string;
  assessment?: string;
  plan?: string;
  followUpInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    bloodGroup?: string;
  };
  doctor: {
    id: string;
    doctorId: string;
    name: string;
    specialization: string;
    phone?: string;
    email?: string;
  };
  appointment?: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
    type: string;
    status: string;
  };
  diagnoses: Diagnosis[];
  vitalSigns: VitalSign[];
  prescriptions: MedicalPrescription[];
  documents: MedicalDocument[];
}

export interface Diagnosis {
  id: string;
  icd10Code?: string;
  description: string;
  type: 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL' | 'PROVISIONAL' | 'FINAL';
  notes?: string;
  diagnosedAt: string;
  resolvedAt?: string;
  isActive: boolean;
  severity?: string;
}

export interface VitalSign {
  id: string;
  type: 'BLOOD_PRESSURE' | 'HEART_RATE' | 'TEMPERATURE' | 'RESPIRATORY_RATE' | 'OXYGEN_SATURATION' | 'WEIGHT' | 'HEIGHT' | 'BMI' | 'PAIN_SCALE';
  value: string;
  unit: string;
  normalRange?: string;
  isAbnormal: boolean;
  notes?: string;
  measuredBy?: string;
  measuredAt: string;
}

export interface MedicalPrescription {
  id: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refills: number;
  instructions?: string;
  warnings?: string;
  isActive: boolean;
  prescribedAt: string;
  medicine: {
    id: string;
    name: string;
    category: string;
    manufacturer?: string;
    dosageInfo?: string;
    sideEffects?: string;
  };
}

export interface MedicalDocument {
  id: string;
  type: 'PRESCRIPTION' | 'LAB_REPORT' | 'RADIOLOGY_REPORT' | 'INSURANCE_DOCUMENT' | 'CONSENT_FORM' | 'MEDICAL_CERTIFICATE' | 'OTHER';
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateMedicalRecordDto {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  recordType: MedicalRecord['recordType'];
  title: string;
  chiefComplaint?: string;
  historyPresent?: string;
  reviewSystems?: string;
  physicalExam?: string;
  assessment?: string;
  plan?: string;
  followUpInstructions?: string;
}

export interface UpdateMedicalRecordDto extends Partial<CreateMedicalRecordDto> {}

export interface MedicalRecordFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  doctorId?: string;
  recordType?: string;
}

class MedicalRecordsApi {
  async getMedicalRecords(filters: MedicalRecordFilters = {}): Promise<PaginatedResponse<MedicalRecord>> {
    const params = new URLSearchParams();

    // Set default pagination values if not provided
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    // Add other filters
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.recordType) params.append('recordType', filters.recordType);

    const response = await api.get(`/medical-records?${params.toString()}`);
    return response.data;
  }

  async getMedicalRecord(id: string): Promise<MedicalRecord> {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  }

  async getPatientMedicalHistory(
    patientId: string,
    filters: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<MedicalRecord>> {
    const params = new URLSearchParams();

    // Set default pagination values if not provided
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/medical-records/patient/${patientId}/history?${params.toString()}`);
    return response.data;
  }

  async createMedicalRecord(data: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await api.post('/medical-records', data);
    return response.data;
  }

  async updateMedicalRecord(id: string, data: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const response = await api.patch(`/medical-records/${id}`, data);
    return response.data;
  }

  async deleteMedicalRecord(id: string): Promise<void> {
    await api.delete(`/medical-records/${id}`);
  }
}

export const medicalRecordsApi = new MedicalRecordsApi();