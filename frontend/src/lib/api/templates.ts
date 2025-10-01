import { apiClient } from './base';

export enum MedicalTemplateCategory {
  PRESCRIPTION = 'PRESCRIPTION',
  DIAGNOSIS = 'DIAGNOSIS',
  MEDICAL_REPORT = 'MEDICAL_REPORT',
  LAB_ORDER = 'LAB_ORDER',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  ADMISSION_FORM = 'ADMISSION_FORM',
  CONSENT_FORM = 'CONSENT_FORM',
  REFERRAL = 'REFERRAL',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
}

export enum MedicalTemplateType {
  FORM = 'FORM',
  DOCUMENT = 'DOCUMENT',
  CHECKLIST = 'CHECKLIST',
}

export interface MedicalTemplate {
  id: string;
  name: string;
  description?: string;
  category: MedicalTemplateCategory;
  templateType: MedicalTemplateType;
  content: any;
  isActive: boolean;
  isSystem: boolean;
  specialization?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  category: MedicalTemplateCategory;
  templateType: MedicalTemplateType;
  content: any;
  isActive?: boolean;
  isSystem?: boolean;
  specialization?: string;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  content?: any;
  isActive?: boolean;
  specialization?: string;
}

export interface TemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: MedicalTemplateCategory;
  templateType?: MedicalTemplateType;
  isActive?: boolean;
  specialization?: string;
}

export const templatesApi = {
  getAll: async (params?: TemplateQueryParams) => {
    const response = await apiClient.get<{
      data: MedicalTemplate[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/templates', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<MedicalTemplate>(`/templates/${id}`);
    return response.data;
  },

  getByCategory: async (category: MedicalTemplateCategory) => {
    const response = await apiClient.get<MedicalTemplate[]>(
      `/templates/categories/${category}`
    );
    return response.data;
  },

  getSystemTemplates: async () => {
    const response = await apiClient.get<MedicalTemplate[]>('/templates/system');
    return response.data;
  },

  create: async (data: CreateTemplateDto) => {
    const response = await apiClient.post<MedicalTemplate>('/templates', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTemplateDto) => {
    const response = await apiClient.patch<MedicalTemplate>(`/templates/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/templates/${id}`);
  },
};
