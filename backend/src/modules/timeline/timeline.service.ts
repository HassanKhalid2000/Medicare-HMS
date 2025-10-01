import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { TimelineQueryDto } from './dto';

export interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: Date;
  status?: string;
  provider?: string;
  category?: string;
  metadata?: any;
}

export interface TimelineResponse {
  events: TimelineEvent[];
  total: number;
  hasMore: boolean;
  summary: {
    totalEvents: number;
    eventTypes: Record<string, number>;
    dateRange: {
      earliest: Date | null;
      latest: Date | null;
    };
  };
}

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async getPatientTimeline(
    patientId: string,
    query: TimelineQueryDto = {}
  ): Promise<TimelineResponse> {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true, patientId: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Return empty timeline for now
    return {
      events: [],
      total: 0,
      hasMore: false,
      summary: {
        totalEvents: 0,
        eventTypes: {},
        dateRange: {
          earliest: null,
          latest: null,
        },
      },
    };
  }

  async getTimelineSummary(patientId: string) {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      patient: {
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
      },
      summary: {
        totalEvents: 0,
        recentActivity: [],
        alerts: [],
        upcomingEvents: [],
      },
    };
  }
}