import { api } from './api';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: string;
  minimumStock: number;
  description?: string;
  sideEffects?: string;
  dosageInfo?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    prescriptions: number;
    medicalPrescriptions: number;
  };
}

export interface MedicineQuery {
  search?: string;
  category?: string;
  manufacturer?: string;
  lowStock?: boolean;
  expired?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMedicineDto {
  name: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  minimumStock?: number;
  description?: string;
  sideEffects?: string;
  dosageInfo?: string;
}

export interface UpdateMedicineDto {
  name?: string;
  category?: string;
  manufacturer?: string;
  batchNumber?: string;
  expiryDate?: string;
  quantity?: number;
  unitPrice?: number;
  minimumStock?: number;
  description?: string;
  sideEffects?: string;
  dosageInfo?: string;
}

export interface PharmacyStatistics {
  total: number;
  lowStock: number;
  expired: number;
  byCategory: Array<{
    category: string;
    count: number;
    totalQuantity: number;
  }>;
}

export const pharmacyService = {
  async getMedicines(query: MedicineQuery = {}): Promise<{ data: Medicine[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    return api.get(`/pharmacy?${params.toString()}`);
  },

  async getMedicine(id: string): Promise<Medicine> {
    return api.get(`/pharmacy/${id}`);
  },

  async createMedicine(data: CreateMedicineDto): Promise<Medicine> {
    return api.post('/pharmacy', data);
  },

  async updateMedicine(id: string, data: UpdateMedicineDto): Promise<Medicine> {
    return api.patch(`/pharmacy/${id}`, data);
  },

  async deleteMedicine(id: string): Promise<void> {
    return api.delete(`/pharmacy/${id}`);
  },

  async adjustStock(id: string, quantity: number): Promise<Medicine> {
    return api.patch(`/pharmacy/${id}/adjust-stock`, { quantity });
  },

  async getStatistics(): Promise<PharmacyStatistics> {
    return api.get('/pharmacy/statistics');
  },
};
