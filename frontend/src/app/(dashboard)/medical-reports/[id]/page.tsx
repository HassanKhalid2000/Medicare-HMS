'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, Eye, Trash2, Calendar, User, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface MedicalReport {
  id: string;
  title: string;
  description?: string;
  type: string;
  format: string;
  status: string;
  filePath?: string;
  fileSize?: number;
  requestedBy: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  filters?: any;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Pending',
    description: 'Report generation is queued',
  },
  PROCESSING: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Processing',
    description: 'Report is being generated',
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Completed',
    description: 'Report is ready for download',
  },
  FAILED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Failed',
    description: 'Report generation failed',
  },
  EXPIRED: {
    icon: AlertCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Expired',
    description: 'Report has expired and is no longer available',
  },
};

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/medical-reports/${reportId}`);
      const data = await response.json();

      if (data.success) {
        setReport(data.data);
      } else {
        console.error('Error fetching report:', data.message);
        router.push('/medical-reports');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      router.push('/medical-reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report || !report.filePath) return;

    try {
      const response = await fetch(`/api/medical-reports/${reportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || `${report.title}.${report.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`/api/medical-reports/${reportId}/regenerate`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchReport();
      }
    } catch (error) {
      console.error('Error regenerating report:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const response = await fetch(`/api/medical-reports/${reportId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/medical-reports');
        }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Report not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The requested report could not be found.
        </p>
        <div className="mt-6">
          <Link
            href="/medical-reports"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig?.icon || FileText;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/medical-reports"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="mt-2 text-sm text-gray-700">
              Report details and download options
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {report.status === 'COMPLETED' && report.filePath && !isExpired(report.expiresAt) && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          )}
          {(report.status === 'FAILED' || report.status === 'EXPIRED') && (
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Report Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-full ${statusConfig?.bgColor}`}>
                  <StatusIcon className={`h-6 w-6 ${statusConfig?.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {statusConfig?.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusConfig?.description}
                  </p>
                </div>
              </div>

              {report.status === 'PROCESSING' && (
                <div className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Report Generation in Progress
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Your report is being generated. This may take a few minutes depending on the data size and complexity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {report.status === 'FAILED' && (
                <div className="mt-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Report Generation Failed
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>There was an error generating your report. Please try regenerating it or contact support if the issue persists.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isExpired(report.expiresAt) && (
                <div className="mt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Report Expired
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>This report has expired and is no longer available for download. You can regenerate it to create a new copy.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Report Details
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{report.type.replace(/_/g, ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Format</dt>
                  <dd className="mt-1 text-sm text-gray-900">{report.format}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(report.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(report.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expires</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(report.expiresAt)}</dd>
                </div>
                {report.fileSize && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">File Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatFileSize(report.fileSize)}</dd>
                  </div>
                )}
                {report.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Filters & Parameters */}
          {report.filters && Object.keys(report.filters).length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Filters & Parameters
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {Object.entries(report.filters).map(([key, value]) => (
                    value && (
                      <div key={key}>
                        <dt className="text-sm font-medium text-gray-500">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {typeof value === 'string' && (key.includes('Date') || key.includes('At'))
                            ? formatDate(value)
                            : String(value)
                          }
                        </dd>
                      </div>
                    )
                  ))}
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg sticky top-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Report Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Requested by</p>
                    <p className="text-sm text-gray-500">{report.user.name}</p>
                    <p className="text-xs text-gray-400">{report.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-500">{formatDate(report.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Format & Size</p>
                    <p className="text-sm text-gray-500">
                      {report.format}
                      {report.fileSize && ` • ${formatFileSize(report.fileSize)}`}
                    </p>
                  </div>
                </div>
              </div>

              {report.status === 'COMPLETED' && report.filePath && !isExpired(report.expiresAt) && (
                <div className="mt-6">
                  <button
                    onClick={handleDownload}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}