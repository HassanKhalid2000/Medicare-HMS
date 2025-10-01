export type TimelineEventType =
  | 'appointment'
  | 'medical_record'
  | 'diagnosis'
  | 'prescription'
  | 'vital_sign'
  | 'admission'
  | 'medical_document';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
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
      earliest: string | null;
      latest: string | null;
    };
  };
}

export interface TimelineQueryParams {
  startDate?: string;
  endDate?: string;
  eventTypes?: string[];
  limit?: number;
  offset?: number;
}

export interface TimelineSummary {
  recentActivity: TimelineEvent[];
  upcomingEvents: TimelineEvent[];
  criticalAlerts: TimelineEvent[];
}