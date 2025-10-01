'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Filter, FileText, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api/base';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  specialization: string;
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

interface ReportFormData {
  title: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  filters: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    doctorId?: string;
    departmentId?: string;
    [key: string]: any;
  };
  expiresAt?: string;
}

const REPORT_TYPES = [
  {
    value: 'PATIENT_SUMMARY',
    label: 'Patient Summary',
    description: 'Comprehensive overview of patient medical information',
    icon: Users,
    fields: ['patientId', 'startDate', 'endDate'],
  },
  {
    value: 'MEDICAL_HISTORY',
    label: 'Medical History',
    description: 'Complete medical history for selected patients',
    icon: FileText,
    fields: ['patientId', 'startDate', 'endDate'],
  },
  {
    value: 'PRESCRIPTION_REPORT',
    label: 'Prescription Report',
    description: 'Medication and prescription analytics',
    icon: FileText,
    fields: ['patientId', 'doctorId', 'startDate', 'endDate'],
  },
  {
    value: 'VITAL_SIGNS_REPORT',
    label: 'Vital Signs Report',
    description: 'Patient vital signs trends and analysis',
    icon: FileText,
    fields: ['patientId', 'startDate', 'endDate'],
  },
  {
    value: 'LAB_RESULTS_REPORT',
    label: 'Lab Results Report',
    description: 'Laboratory test results and trends',
    icon: FileText,
    fields: ['patientId', 'doctorId', 'startDate', 'endDate'],
  },
  {
    value: 'ADMISSION_REPORT',
    label: 'Admission Report',
    description: 'Hospital admissions and discharge statistics',
    icon: FileText,
    fields: ['departmentId', 'startDate', 'endDate'],
  },
  {
    value: 'FINANCIAL_REPORT',
    label: 'Financial Report',
    description: 'Billing, payments, and financial analytics',
    icon: FileText,
    fields: ['patientId', 'doctorId', 'startDate', 'endDate'],
  },
  {
    value: 'APPOINTMENT_REPORT',
    label: 'Appointment Report',
    description: 'Appointment scheduling and attendance analytics',
    icon: Calendar,
    fields: ['doctorId', 'startDate', 'endDate'],
  },
  {
    value: 'DIAGNOSIS_REPORT',
    label: 'Diagnosis Report',
    description: 'Diagnosis trends and statistical analysis',
    icon: FileText,
    fields: ['doctorId', 'startDate', 'endDate'],
  },
  {
    value: 'CUSTOM_REPORT',
    label: 'Custom Report',
    description: 'Custom data analysis and reporting',
    icon: Settings,
    fields: ['patientId', 'doctorId', 'startDate', 'endDate'],
  },
];

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get('type') as ReportType;

  const [formData, setFormData] = useState<ReportFormData>({
    title: '',
    description: '',
    type: preselectedType || ReportType.PATIENT_SUMMARY,
    format: ReportFormat.PDF,
    filters: {},
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (preselectedType) {
      const reportType = REPORT_TYPES.find(t => t.value === preselectedType);
      if (reportType) {
        setFormData(prev => ({
          ...prev,
          type: preselectedType,
          title: `${reportType.label} - ${new Date().toLocaleDateString()}`,
        }));
      }
    }
  }, [preselectedType]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      const data = response.data;
      if (data.success) {
        setPatients(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      const data = response.data;
      if (data.success) {
        setDoctors(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/medical-reports', formData);
      const data = response.data;

      if (data.success) {
        router.push('/medical-reports');
      } else {
        console.error('Error creating report:', data.message);
      }
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateFilter = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value,
      },
    }));
  };

  const selectedReportType = REPORT_TYPES.find(t => t.value === formData.type);
  const requiredFields = selectedReportType?.fields || [];

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
            <h1 className="text-2xl font-bold text-gray-900">Generate New Report</h1>
            <p className="mt-2 text-sm text-gray-700">
              Create comprehensive medical reports with customizable parameters
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Report Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Report Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      placeholder="Enter report title"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Report Type *
                    </label>
                    <select
                      id="type"
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={formData.type}
                      onChange={(e) => updateFormData('type', e.target.value as ReportType)}
                    >
                      {REPORT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                      Format *
                    </label>
                    <select
                      id="format"
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={formData.format}
                      onChange={(e) => updateFormData('format', e.target.value as ReportFormat)}
                    >
                      <option value="PDF">PDF</option>
                      <option value="CSV">CSV</option>
                      <option value="EXCEL">Excel</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Optional description for this report"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  <Filter className="h-5 w-5 inline mr-2" />
                  Filters & Parameters
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {requiredFields.includes('startDate') && (
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.filters.startDate || ''}
                        onChange={(e) => updateFilter('startDate', e.target.value)}
                      />
                    </div>
                  )}

                  {requiredFields.includes('endDate') && (
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={formData.filters.endDate || ''}
                        onChange={(e) => updateFilter('endDate', e.target.value)}
                      />
                    </div>
                  )}

                  {requiredFields.includes('patientId') && (
                    <div>
                      <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                        Patient
                      </label>
                      <select
                        id="patientId"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.filters.patientId || ''}
                        onChange={(e) => updateFilter('patientId', e.target.value)}
                      >
                        <option value="">All Patients</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.patientId})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {requiredFields.includes('doctorId') && (
                    <div>
                      <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                        Doctor
                      </label>
                      <select
                        id="doctorId"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.filters.doctorId || ''}
                        onChange={(e) => updateFilter('doctorId', e.target.value)}
                      >
                        <option value="">All Doctors</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {requiredFields.includes('departmentId') && (
                    <div>
                      <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <select
                        id="departmentId"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={formData.filters.departmentId || ''}
                        onChange={(e) => updateFilter('departmentId', e.target.value)}
                      >
                        <option value="">All Departments</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="orthopedics">Orthopedics</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Advanced Settings
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700">
                      Expiration Date
                    </label>
                    <input
                      type="datetime-local"
                      id="expiresAt"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.expiresAt || ''}
                      onChange={(e) => updateFormData('expiresAt', e.target.value)}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Leave empty for default 30-day expiration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg sticky top-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Report Preview
                </h3>

                {selectedReportType && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <selectedReportType.icon className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {selectedReportType.label}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {selectedReportType.description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Title
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {formData.title || 'Untitled Report'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Format
                          </dt>
                          <dd className="text-sm text-gray-900">{formData.format}</dd>
                        </div>
                        {formData.filters.startDate && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Date Range
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {formData.filters.startDate} to {formData.filters.endDate || 'Present'}
                            </dd>
                          </div>
                        )}
                        {formData.filters.patientId && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Patient
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {patients.find(p => p.id === formData.filters.patientId)?.firstName} {patients.find(p => p.id === formData.filters.patientId)?.lastName}
                            </dd>
                          </div>
                        )}
                        {formData.filters.doctorId && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Doctor
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {doctors.find(d => d.id === formData.filters.doctorId)?.name}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/medical-reports"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !formData.title.trim()}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}