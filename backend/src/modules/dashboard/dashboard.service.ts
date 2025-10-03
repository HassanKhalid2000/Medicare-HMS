import { Injectable } from '@nestjs/common';
import { DoctorsService } from '../doctors/doctors.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { BillingService } from '../billing/billing.service';
import { PrismaService } from '../../config/database.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly appointmentsService: AppointmentsService,
    private readonly billingService: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  async getAllStatistics() {
    try {
      // Get statistics from each service
      const [doctorStats, appointmentStats, billingStats, patientStats, admissionStats, revenueStats] = await Promise.all([
        this.doctorsService.getStatistics(),
        this.appointmentsService.getStatistics(),
        this.billingService.getStatistics(),
        this.getPatientStatistics(),
        this.getAdmissionStatistics(),
        this.getRevenueStatistics(),
      ]);

      return {
        patients: patientStats,
        doctors: doctorStats,
        appointments: appointmentStats,
        billing: billingStats,
        admissions: admissionStats,
        revenue: revenueStats,
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      // Return default statistics if there's an error
      return {
        patients: {
          total: 0,
          active: 0,
          byGender: {},
          newThisMonth: 0,
        },
        doctors: {
          total: 0,
          active: 0,
          inactive: 0,
          onLeave: 0,
          bySpecialization: {},
        },
        appointments: {
          total: 0,
          scheduled: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          byType: {},
          byDoctor: {},
        },
        billing: {
          totalRevenue: '0',
          totalPending: '0',
          totalOverdue: '0',
          billsCount: 0,
          pendingCount: 0,
          overdueCount: 0,
        },
        admissions: {
          total: 0,
          active: 0,
          discharged: 0,
          pending: 0,
          byWard: [],
        },
        revenue: {
          last6Months: [],
          byPaymentMethod: [],
        },
      };
    }
  }

  private async getPatientStatistics() {
    try {
      // Get patient statistics directly from database since patients service might not exist
      const total = await this.prisma.patient.count();
      const active = await this.prisma.patient.count({
        where: { status: 'active' }
      });

      // Get patients by gender
      const byGenderData = await this.prisma.patient.groupBy({
        by: ['gender'],
        _count: { gender: true },
      });

      const byGender = byGenderData.reduce((acc, item) => {
        acc[item.gender] = item._count.gender;
        return acc;
      }, {} as Record<string, number>);

      // Get new patients this month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const newThisMonth = await this.prisma.patient.count({
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
      });

      return {
        total,
        active,
        byGender,
        newThisMonth,
      };
    } catch (error) {
      console.error('Error fetching patient statistics:', error);
      return {
        total: 0,
        active: 0,
        byGender: {},
        newThisMonth: 0,
      };
    }
  }

  private async getAdmissionStatistics() {
    try {
      const [total, active, discharged, transferred] = await Promise.all([
        this.prisma.admission.count(),
        this.prisma.admission.count({
          where: { status: 'admitted' }
        }),
        this.prisma.admission.count({
          where: { status: 'discharged' }
        }),
        this.prisma.admission.count({
          where: { status: 'transferred' }
        })
      ]);

      // Get ward counts manually since groupBy has type issues
      const admittedAdmissions = await this.prisma.admission.findMany({
        where: { status: 'admitted' },
        select: { ward: true }
      });

      const wardCounts = admittedAdmissions.reduce((acc, admission) => {
        const wardName = admission.ward;
        acc[wardName] = (acc[wardName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byWard = Object.entries(wardCounts).map(([ward, count]) => ({
        ward,
        count
      }));

      return {
        total,
        active,
        discharged,
        pending: transferred,
        byWard
      };
    } catch (error) {
      console.error('Error fetching admission statistics:', error);
      return {
        total: 0,
        active: 0,
        discharged: 0,
        pending: 0,
        byWard: []
      };
    }
  }

  private async getRevenueStatistics() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);

      // Get bills for last 6 months
      const bills = await this.prisma.bill.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true,
          paidAmount: true,
          paymentMethod: true
        }
      });

      // Group by month
      const monthlyRevenue = new Map<string, number>();
      const paymentMethods = new Map<string, number>();

      bills.forEach(bill => {
        const monthKey = `${bill.createdAt.getFullYear()}-${String(bill.createdAt.getMonth() + 1).padStart(2, '0')}`;
        const amount = Number(bill.paidAmount) || 0;

        monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + amount);
        paymentMethods.set(bill.paymentMethod, (paymentMethods.get(bill.paymentMethod) || 0) + amount);
      });

      // Convert to array format for charts
      const last6Months = Array.from(monthlyRevenue.entries())
        .map(([month, revenue]) => ({
          month,
          revenue: revenue.toFixed(2)
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const byPaymentMethod = Array.from(paymentMethods.entries())
        .map(([method, revenue]) => ({
          method,
          revenue: revenue.toFixed(2)
        }));

      return {
        last6Months,
        byPaymentMethod
      };
    } catch (error) {
      console.error('Error fetching revenue statistics:', error);
      return {
        last6Months: [],
        byPaymentMethod: []
      };
    }
  }

}