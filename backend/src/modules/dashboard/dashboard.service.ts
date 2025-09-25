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
      const [doctorStats, appointmentStats, billingStats, patientStats] = await Promise.all([
        this.doctorsService.getStatistics(),
        this.appointmentsService.getStatistics(),
        this.billingService.getStatistics(),
        this.getPatientStatistics(),
      ]);

      return {
        patients: patientStats,
        doctors: doctorStats,
        appointments: appointmentStats,
        billing: billingStats,
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

}