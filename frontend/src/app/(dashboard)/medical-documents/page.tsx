'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Upload, FileText, Image, FileCheck } from 'lucide-react';
import { DocumentType } from '@/types/medical-documents';

interface MedicalDocument {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  type: DocumentType;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  medicalRecord?: {
    id: string;
    title: string;
    recordType: string;
  };
}

interface DocumentStats {
  total: number;
  byType: Array<{
    type: DocumentType;
    count: number;
  }>;
}

const DOCUMENT_TYPES = [
  { value: 'PRESCRIPTION', label: 'Prescription', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  { value: 'LAB_REPORT', label: 'Lab Report', icon: FileCheck, color: 'bg-green-100 text-green-800' },
  { value: 'RADIOLOGY_REPORT', label: 'Radiology Report', icon: Image, color: 'bg-purple-100 text-purple-800' },
  { value: 'INSURANCE_DOCUMENT', label: 'Insurance Document', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONSENT_FORM', label: 'Consent Form', icon: FileCheck, color: 'bg-red-100 text-red-800' },
  { value: 'MEDICAL_CERTIFICATE', label: 'Medical Certificate', icon: FileText, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'OTHER', label: 'Other', icon: FileText, color: 'bg-gray-100 text-gray-800' },
] as const;

export default function MedicalDocumentsPage() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats>({ total: 0, byType: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | ''>('');
  const [patientFilter, setPatientFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [searchQuery, typeFilter, patientFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) {
        const response = await fetch(`/api/medical-documents/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setDocuments(data);
      } else {
        if (patientFilter) params.append('patientId', patientFilter);
        if (typeFilter) params.append('type', typeFilter);
        params.append('isActive', 'true');

        const response = await fetch(`/api/medical-documents?${params.toString()}`);
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/medical-documents/statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/medical-documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeInfo = (type: DocumentType) => {
    return DOCUMENT_TYPES.find(t => t.value === type) || DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
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
          <h1 className="text-2xl font-bold text-gray-900">Medical Documents</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage patient medical documents, files, and records
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </button>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Documents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {stats.byType.slice(0, 3).map((typeCount, index) => {
          const typeInfo = getDocumentTypeInfo(typeCount.type);
          const TypeIcon = typeInfo.icon;

          return (
            <div key={typeCount.type} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TypeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {typeInfo.label}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {typeCount.count}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Documents
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search by title, description, or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Document Type
              </label>
              <select
                id="type-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as DocumentType | '')}
              >
                <option value="">All Types</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="patient-filter" className="block text-sm font-medium text-gray-700">
                Patient ID
              </label>
              <input
                type="text"
                id="patient-filter"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="Filter by patient ID..."
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Documents ({documents.length})
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading a new document.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents.map((document) => {
              const typeInfo = getDocumentTypeInfo(document.type);
              const TypeIcon = typeInfo.icon;

              return (
                <li key={document.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <TypeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {document.title}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <span className="truncate">
                            Patient: {document.patient.firstName} {document.patient.lastName} ({document.patient.patientId})
                          </span>
                          <span className="mx-2">•</span>
                          <span>{document.fileName}</span>
                          <span className="mx-2">•</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                        {document.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {document.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
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

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
              <p className="mt-2 text-sm text-gray-500">
                Upload functionality will be implemented in the next phase.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}