'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, FileText, BarChart3, Users, Calendar, Stethoscope, Activity, ClipboardList, DollarSign, FileCheck, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api/base';

interface MedicalReport {
  id: string;
  title: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  filePath?: string;
  fileSize?: number;
  requestedBy: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ReportStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  byType: Array<{
    type: ReportType;
    count: number;
  }>;
}

enum ReportType {
  PATIENT_SUMMARY = 'PATIENT_SUMMARY',
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  PRESCRIPTION_REPORT = 'PRESCRIPTION_REPORT',
  VITAL_SIGNS_REPORT = 'VITAL_SIGNS_REPORT',
  LAB_RESULTS_REPORT = 'LAB_RESULTS_REPORT',
  ADMISSION_REPORT = 'ADMISSION_REPORT',
  FINANCIAL_REPORT = 'FINANCIAL_REPORT',
  APPOINTMENT_REPORT = 'APPOINTMENT_REPORT',
  DIAGNOSIS_REPORT = 'DIAGNOSIS_REPORT',
  CUSTOM_REPORT = 'CUSTOM_REPORT',
}

enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

const REPORT_TYPES = [
  { value: 'PATIENT_SUMMARY', label: 'Patient Summary', icon: Users, color: 'bg-blue-100 text-blue-800', description: 'Comprehensive patient overview' },
  { value: 'MEDICAL_HISTORY', label: 'Medical History', icon: ClipboardList, color: 'bg-green-100 text-green-800', description: 'Patient medical history report' },
  { value: 'PRESCRIPTION_REPORT', label: 'Prescription Report', icon: FileText, color: 'bg-purple-100 text-purple-800', description: 'Medication and prescription data' },
  { value: 'VITAL_SIGNS_REPORT', label: 'Vital Signs Report', icon: Activity, color: 'bg-red-100 text-red-800', description: 'Patient vital signs analysis' },
  { value: 'LAB_RESULTS_REPORT', label: 'Lab Results Report', icon: FileCheck, color: 'bg-teal-100 text-teal-800', description: 'Laboratory test results' },
  { value: 'ADMISSION_REPORT', label: 'Admission Report', icon: Stethoscope, color: 'bg-indigo-100 text-indigo-800', description: 'Hospital admission statistics' },
  { value: 'FINANCIAL_REPORT', label: 'Financial Report', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800', description: 'Billing and payment analysis' },
  { value: 'APPOINTMENT_REPORT', label: 'Appointment Report', icon: Calendar, color: 'bg-pink-100 text-pink-800', description: 'Appointment scheduling data' },
  { value: 'DIAGNOSIS_REPORT', label: 'Diagnosis Report', icon: BarChart3, color: 'bg-orange-100 text-orange-800', description: 'Diagnosis trends and statistics' },
  { value: 'CUSTOM_REPORT', label: 'Custom Report', icon: FileText, color: 'bg-gray-100 text-gray-800', description: 'Custom data analysis' },
] as const;

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

export default function MedicalReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [stats, setStats] = useState<ReportStats>({ total: 0, pending: 0, completed: 0, failed: 0, byType: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [formatFilter, setFormatFilter] = useState<ReportFormat | ''>('');

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [searchQuery, typeFilter, statusFilter, formatFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append('search', searchQuery);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (formatFilter) params.append('format', formatFilter);

      const response = await api.get(`/medical-reports?${params.toString()}`);
      const data = response.data;

      if (data.success) {
        setReports(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/medical-reports/stats/summary');
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const response = await api.get(`/medical-reports/${reportId}/download`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers['content-disposition']?.split('filename=')[1] || 'report';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleRegenerate = async (reportId: string) => {
    try {
      await api.post(`/medical-reports/${reportId}/regenerate`);
      await fetchReports();
    } catch (error) {
      console.error('Error regenerating report:', error);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await api.delete(`/medical-reports/${reportId}`);
        await fetchReports();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getReportTypeInfo = (type: ReportType) => {
    return REPORT_TYPES.find(t => t.value === type) || REPORT_TYPES[REPORT_TYPES.length - 1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate, manage, and download comprehensive medical reports
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/medical-reports/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Reports</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RefreshCw className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileCheck className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.completed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.failed}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Report Types */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Report Generation</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {REPORT_TYPES.slice(0, 5).map((reportType) => {
              const Icon = reportType.icon;
              return (
                <Link
                  key={reportType.value}
                  href={`/medical-reports/new?type=${reportType.value}`}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{reportType.label}</p>
                    <p className="text-sm text-gray-500 truncate">{reportType.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Reports
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Report Type
              </label>
              <select
                id="type-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ReportType | '')}
              >
                <option value="">All Types</option>
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div>
              <label htmlFor="format-filter" className="block text-sm font-medium text-gray-700">
                Format
              </label>
              <select
                id="format-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as ReportFormat | '')}
              >
                <option value="">All Formats</option>
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
                <option value="EXCEL">Excel</option>
                <option value="JSON">JSON</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Reports ({reports.length})
          </h3>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by generating your first report.
            </p>
            <div className="mt-6">
              <Link
                href="/medical-reports/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reports.map((report) => {
              const typeInfo = getReportTypeInfo(report.type);
              const TypeIcon = typeInfo.icon;

              return (
                <li key={report.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <TypeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {report.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            Requested by: {report.user.name}
                          </span>
                          <span className="mx-2">•</span>
                          <span>Format: {report.format}</span>
                          {report.fileSize && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{formatFileSize(report.fileSize)}</span>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span>Created: {formatDate(report.createdAt)}</span>
                        </div>
                        {report.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.status === 'COMPLETED' && report.filePath && (
                        <button
                          onClick={() => handleDownload(report.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        href={`/medical-reports/${report.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {(report.status === 'FAILED' || report.status === 'EXPIRED') && (
                        <button
                          onClick={() => handleRegenerate(report.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Regenerate"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}