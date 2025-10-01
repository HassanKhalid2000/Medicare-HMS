import { api } from './api';

export interface BillItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Bill {
  id?: string;
  invoiceNumber?: string;
  patientId: string;
  totalAmount: string;
  taxAmount?: string;
  discountAmount?: string;
  paidAmount?: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'insurance';
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue';
  dueDate?: Date | string;
  notes?: string;
  billItems: BillItem[];
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  finalAmount?: string;
  balance?: string;
  isOverdue?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BillQuery {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: string;
  patientId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ProcessPayment {
  amount: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'insurance';
  notes?: string;
}

export interface BillStatistics {
  totalRevenue: string;
  totalPending: string;
  totalOverdue: string;
  billsCount: number;
  pendingCount: number;
  overdueCount: number;
}

export const billingService = {
  // Get all bills with filtering
  async getBills(query: BillQuery = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return api.get<{
      data: Bill[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/billing?${searchParams.toString()}`);
  },

  // Get single bill by ID
  async getBill(id: string) {
    return api.get<Bill>(`/billing/${id}`);
  },

  // Create new bill
  async createBill(bill: Omit<Bill, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>) {
    return api.post<Bill>('/billing', bill);
  },

  // Update bill
  async updateBill(id: string, bill: Partial<Bill>) {
    return api.patch<Bill>(`/billing/${id}`, bill);
  },

  // Delete bill
  async deleteBill(id: string) {
    return api.delete(`/billing/${id}`);
  },

  // Process payment for a bill
  async processPayment(id: string, payment: ProcessPayment) {
    return api.post<Bill>(`/billing/${id}/payment`, payment);
  },

  // Get billing statistics
  async getStatistics() {
    return api.get<BillStatistics>('/billing/statistics');
  },
};