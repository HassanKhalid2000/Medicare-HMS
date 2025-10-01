'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  FileText,
  Pill,
  Activity,
  Building2,
  Files,
  AlertTriangle,
  User,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { TimelineEvent, TimelineSummary } from '@/types/timeline';

interface TimelineSummaryWidgetProps {
  patientId: string;
  className?: string;
}

const EVENT_ICONS = {
  appointment: Calendar,
  medical_record: FileText,
  diagnosis: Activity,
  prescription: Pill,
  vital_sign: Activity,
  admission: Building2,
  medical_document: Files,
};

export default function TimelineSummaryWidget({
  patientId,
  className = ''
}: TimelineSummaryWidgetProps) {
  const [summary, setSummary] = useState<TimelineSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [patientId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeline/patient/${patientId}/summary`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching timeline summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatUpcomingDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Recent Activity
          </h3>
          <Link
            href={`/patients/${patientId}/timeline`}
            className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
          >
            View full timeline
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="p-6">
        {/* Critical Alerts */}
        {summary.criticalAlerts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Critical Alerts ({summary.criticalAlerts.length})
            </h4>
            <div className="space-y-2">
              {summary.criticalAlerts.slice(0, 3).map((event) => {
                const Icon = EVENT_ICONS[event.type] || FileText;
                return (
                  <div key={event.id} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                    <Icon className="h-4 w-4 text-red-600 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-red-700 truncate">
                        {formatEventDate(event.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recent Events ({summary.recentActivity.length})
          </h4>
          {summary.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {summary.recentActivity.slice(0, 5).map((event) => {
                const Icon = EVENT_ICONS[event.type] || FileText;
                return (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-1.5 bg-gray-100 rounded-md">
                      <Icon className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatEventDate(event.date)}</span>
                        {event.provider && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {event.provider}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        {summary.upcomingEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-700 mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming ({summary.upcomingEvents.length})
            </h4>
            <div className="space-y-2">
              {summary.upcomingEvents.slice(0, 3).map((event) => {
                const Icon = EVENT_ICONS[event.type] || Calendar;
                return (
                  <div key={event.id} className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <Icon className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-blue-700">
                        {formatUpcomingDate(event.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Activity State */}
        {summary.recentActivity.length === 0 &&
         summary.upcomingEvents.length === 0 &&
         summary.criticalAlerts.length === 0 && (
          <div className="text-center py-8">
            <Clock className="mx-auto h-8 w-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">No recent medical activity</p>
          </div>
        )}
      </div>
    </div>
  );
}