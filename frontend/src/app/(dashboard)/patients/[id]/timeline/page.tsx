'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Clock,
  Calendar,
  FileText,
  Pill,
  Activity,
  Building2,
  Files,
  Filter,
  ChevronDown,
  AlertTriangle,
  User,
  Stethoscope
} from 'lucide-react';
import { TimelineEvent, TimelineResponse, TimelineQueryParams, TimelineEventType } from '@/types/timeline';

const EVENT_TYPE_CONFIG = {
  appointment: {
    icon: Calendar,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Appointment'
  },
  medical_record: {
    icon: FileText,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Medical Record'
  },
  diagnosis: {
    icon: Stethoscope,
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Diagnosis'
  },
  prescription: {
    icon: Pill,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Prescription'
  },
  vital_sign: {
    icon: Activity,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'Vital Signs'
  },
  admission: {
    icon: Building2,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    label: 'Admission'
  },
  medical_document: {
    icon: Files,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Document'
  },
};

export default function PatientTimelinePage() {
  const params = useParams();
  const patientId = params.id as string;

  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventTypes, setSelectedEventTypes] = useState<TimelineEventType[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, [patientId, selectedEventTypes, dateRange]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedEventTypes.length > 0) {
        selectedEventTypes.forEach(type => params.append('eventTypes', type));
      } else {
        params.append('eventTypes', 'all');
      }

      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      params.append('limit', '50');

      const response = await fetch(`/api/timeline/patient/${patientId}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setTimeline(data);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const getStatusColor = (event: TimelineEvent) => {
    if (event.status === 'critical' || event.status === 'abnormal') {
      return 'border-l-red-500 bg-red-50';
    }
    if (event.status === 'pending' || event.status === 'scheduled') {
      return 'border-l-yellow-500 bg-yellow-50';
    }
    return 'border-l-green-500 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Medical Timeline</h1>
          <p className="mt-2 text-sm text-gray-700">
            Complete chronological view of patient medical history
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {timeline && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Events
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {timeline.summary.totalEvents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {Object.entries(timeline.summary.eventTypes).slice(0, 3).map(([type, count]) => {
            const config = EVENT_TYPE_CONFIG[type as TimelineEventType];
            if (!config) return null;

            const Icon = config.icon;
            return (
              <div key={type} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {config.label}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Event Types</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                  <label key={type} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      checked={selectedEventTypes.includes(type as TimelineEventType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEventTypes(prev => [...prev, type as TimelineEventType]);
                        } else {
                          setSelectedEventTypes(prev => prev.filter(t => t !== type));
                        }
                      }}
                    />
                    <span className="ml-2 text-sm text-gray-700">{config.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {!timeline || timeline.events.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No timeline events</h3>
            <p className="mt-1 text-sm text-gray-500">
              No medical events found for the selected criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {timeline.events.map((event, index) => {
              const config = EVENT_TYPE_CONFIG[event.type];
              const Icon = config.icon;
              const formatted = formatDate(event.date);

              return (
                <div key={event.id} className={`p-6 ${getStatusColor(event)}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-2 rounded-lg border ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatted.relative}</span>
                          <span>•</span>
                          <span>{formatted.date}</span>
                          <span>{formatted.time}</span>
                        </div>
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {event.description}
                      </p>

                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        {event.provider && (
                          <span className="inline-flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {event.provider}
                          </span>
                        )}
                        {event.category && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            {event.category}
                          </span>
                        )}
                        {event.status && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'critical' || event.status === 'abnormal'
                              ? 'bg-red-100 text-red-800'
                              : event.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {event.status === 'critical' || event.status === 'abnormal' ? (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            ) : null}
                            {event.status}
                          </span>
                        )}
                      </div>

                      {/* Metadata Display */}
                      {event.metadata && (
                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-md p-2">
                          {event.type === 'vital_sign' && event.metadata.value && (
                            <span>Value: {event.metadata.value} {event.metadata.unit}</span>
                          )}
                          {event.type === 'prescription' && event.metadata.medications && (
                            <div>
                              <span className="font-medium">Medications:</span>
                              <ul className="mt-1 list-disc list-inside">
                                {event.metadata.medications.slice(0, 3).map((med: any, i: number) => (
                                  <li key={i}>{med.name} - {med.dosage}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {event.type === 'medical_document' && event.metadata.fileName && (
                            <span>File: {event.metadata.fileName}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {timeline && timeline.hasMore && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => {
                // Load more functionality would go here
                console.log('Load more events');
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
            >
              Load more events...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}