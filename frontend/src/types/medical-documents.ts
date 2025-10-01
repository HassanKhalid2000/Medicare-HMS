export type DocumentType =
  | 'PRESCRIPTION'
  | 'LAB_REPORT'
  | 'RADIOLOGY_REPORT'
  | 'INSURANCE_DOCUMENT'
  | 'CONSENT_FORM'
  | 'MEDICAL_CERTIFICATE'
  | 'OTHER';

export interface MedicalDocument {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  type: DocumentType;
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  medicalRecord?: {
    id: string;
    title: string;
    recordType: string;
  };
}

export interface CreateMedicalDocumentDto {
  patientId: string;
  medicalRecordId?: string;
  type: DocumentType;
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isActive?: boolean;
}

export interface UpdateMedicalDocumentDto {
  patientId?: string;
  medicalRecordId?: string;
  type?: DocumentType;
  title?: string;
  description?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  isActive?: boolean;
}

export interface DocumentStats {
  total: number;
  byType: Array<{
    type: DocumentType;
    count: number;
  }>;
}

export interface SearchPatientsResult {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
}