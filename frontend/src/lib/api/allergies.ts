import api from './base';

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  category: string;
  reaction: string;
  severity: string;
  notes?: string;
  diagnosedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
}

export interface CreateAllergyDto {
  patientId: string;
  allergen: string;
  category: string;
  reaction: string;
  severity: string;
  notes?: string;
  diagnosedAt?: string;
}

export interface UpdateAllergyDto {
  allergen?: string;
  category?: string;
  reaction?: string;
  severity?: string;
  notes?: string;
  diagnosedAt?: string;
  isActive?: boolean;
}

export interface AllergyFilters {
  patientId?: string;
  category?: string;
  severity?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DrugAllergyCheck {
  hasAllergy: boolean;
  allergies: Allergy[];
}

export const allergiesApi = {
  async getAllergies(filters: AllergyFilters = {}): Promise<PaginatedResponse<Allergy>> {
    const params = new URLSearchParams();

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.category) params.append('category', filters.category);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/allergies?${params.toString()}`);
    return response.data;
  },

  async getAllergy(id: string): Promise<Allergy> {
    const response = await api.get(`/allergies/${id}`);
    return response.data;
  },

  async getPatientAllergies(patientId: string): Promise<Allergy[]> {
    const response = await api.get(`/allergies/patient/${patientId}`);
    return response.data;
  },

  async checkDrugAllergy(patientId: string, drugName: string): Promise<DrugAllergyCheck> {
    const response = await api.get(`/allergies/check-drug/${patientId}/${encodeURIComponent(drugName)}`);
    return response.data;
  },

  async createAllergy(data: CreateAllergyDto): Promise<Allergy> {
    const response = await api.post('/allergies', data);
    return response.data;
  },

  async updateAllergy(id: string, data: UpdateAllergyDto): Promise<Allergy> {
    const response = await api.patch(`/allergies/${id}`, data);
    return response.data;
  },

  async deactivateAllergy(id: string): Promise<Allergy> {
    const response = await api.patch(`/allergies/${id}/deactivate`);
    return response.data;
  },

  async deleteAllergy(id: string): Promise<void> {
    await api.delete(`/allergies/${id}`);
  },
};
