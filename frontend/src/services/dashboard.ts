import { api } from './api';

// Raw API response structure
interface ApiDashboardStatistics {
  patients: {
    total: number;
    active: number;
    byGender: Record<string, number>;
    newThisMonth: number;
  };
  doctors: {
    total: number;
    active: number;
    inactive: number;
    specializations: Array<{
      specialization: string;
      count: number;
    }>;
  };
  appointments: {
    total: number;
    today: number;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
    byType: Array<{
      type: string;
      count: number;
    }>;
  };
  billing: {
    totalBills: number;
    monthlyBills: number;
    overdueCount: number;
    totalRevenue: string;
    monthlyRevenue: string;
    paymentStatusBreakdown: Array<{
      status: string;
      count: number;
    }>;
  };
  admissions: {
    total: number;
    active: number;
    discharged: number;
    pending: number;
    byWard: Array<{
      ward: string;
      count: number;
    }>;
  };
  revenue: {
    last6Months: Array<{
      month: string;
      revenue: string;
    }>;
    byPaymentMethod: Array<{
      method: string;
      revenue: string;
    }>;
  };
}

// Frontend compatible interface
export interface DashboardStatistics {
  patients: {
    total: number;
    active: number;
    byGender: Record<string, number>;
    newThisMonth: number;
  };
  doctors: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    bySpecialization: Record<string, number>;
  };
  appointments: {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    byType: Record<string, number>;
    byDoctor: Record<string, number>;
  };
  billing: {
    totalRevenue: string;
    totalPending: string;
    totalOverdue: string;
    billsCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  admissions: {
    total: number;
    active: number;
    discharged: number;
    pending: number;
    byWard: Array<{
      ward: string;
      count: number;
    }>;
  };
  revenue: {
    last6Months: Array<{
      month: string;
      revenue: string;
    }>;
    byPaymentMethod: Array<{
      method: string;
      revenue: string;
    }>;
  };
}

export const dashboardService = {
  // Get all dashboard statistics from the new unified endpoint
  async getAllStatistics(): Promise<DashboardStatistics> {
    try {
      const rawData = await api.get<ApiDashboardStatistics>('/dashboard/statistics');

      // Transform the API response to match frontend expectations
      const transformedData: DashboardStatistics = {
        patients: rawData.patients,
        doctors: {
          total: rawData.doctors.total,
          active: rawData.doctors.active,
          inactive: rawData.doctors.inactive,
          onLeave: 0, // Not provided by API, defaulting to 0
          bySpecialization: rawData.doctors.specializations.reduce((acc, item) => {
            acc[item.specialization] = item.count;
            return acc;
          }, {} as Record<string, number>)
        },
        appointments: {
          total: rawData.appointments.total,
          scheduled: rawData.appointments.byStatus.find(s => s.status === 'scheduled')?.count || 0,
          confirmed: rawData.appointments.byStatus.find(s => s.status === 'confirmed')?.count || 0,
          completed: rawData.appointments.byStatus.find(s => s.status === 'completed')?.count || 0,
          cancelled: rawData.appointments.byStatus.find(s => s.status === 'cancelled')?.count || 0,
          byType: rawData.appointments.byType.reduce((acc, item) => {
            acc[item.type] = item.count;
            return acc;
          }, {} as Record<string, number>),
          byDoctor: {} // Not provided by API, defaulting to empty object
        },
        billing: {
          totalRevenue: rawData.billing.totalRevenue,
          totalPending: "0", // Not directly provided, could be computed
          totalOverdue: "0", // Not directly provided, could be computed
          billsCount: rawData.billing.totalBills,
          pendingCount: rawData.billing.paymentStatusBreakdown.find(s => s.status === 'pending')?.count || 0,
          overdueCount: rawData.billing.overdueCount
        },
        admissions: rawData.admissions,
        revenue: rawData.revenue
      };

      return transformedData;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  },
};