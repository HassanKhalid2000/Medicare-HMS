'use client';

import { useState } from 'react';
import { Edit, Trash2, FileText, User, Calendar, Activity, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Diagnosis, diagnosesApi } from '@/lib/api/diagnoses';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface DiagnosisDetailsProps {
  diagnosis: Diagnosis;
  onClose: () => void;
  onUpdate: () => void;
}

const diagnosisTypeLabels = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
  DIFFERENTIAL: 'Differential',
  PROVISIONAL: 'Provisional',
  FINAL: 'Final',
};

const diagnosisTypeColors = {
  PRIMARY: 'destructive',
  SECONDARY: 'secondary',
  DIFFERENTIAL: 'outline',
  PROVISIONAL: 'default',
  FINAL: 'default',
} as const;

export default function DiagnosisDetails({ diagnosis, onClose, onUpdate }: DiagnosisDetailsProps) {
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    toast.info('Edit functionality will be implemented in the next phase');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this diagnosis?')) {
      return;
    }

    try {
      setLoading(true);
      await diagnosesApi.deleteDiagnosis(diagnosis.id);
      toast.success('Diagnosis deleted successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to delete diagnosis');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!confirm('Are you sure you want to mark this diagnosis as resolved?')) {
      return;
    }

    try {
      setLoading(true);
      await diagnosesApi.resolveDiagnosis(diagnosis.id);
      toast.success('Diagnosis resolved successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to resolve diagnosis');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    const action = diagnosis.isActive ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} this diagnosis?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      if (diagnosis.isActive) {
        await diagnosesApi.deactivateDiagnosis(diagnosis.id);
        toast.success('Diagnosis deactivated successfully');
      } else {
        await diagnosesApi.activateDiagnosis(diagnosis.id);
        toast.success('Diagnosis activated successfully');
      }
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${action} diagnosis`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full">
      <div className="pb-4 border-b mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{diagnosis.description}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {diagnosis.patient.firstName} {diagnosis.patient.lastName}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(diagnosis.diagnosedAt)}
              </div>
              <Badge variant={diagnosisTypeColors[diagnosis.type]}>
                {diagnosisTypeLabels[diagnosis.type]}
              </Badge>
              {!diagnosis.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {diagnosis.resolvedAt && (
                <Badge variant="outline">Resolved</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {!diagnosis.resolvedAt && diagnosis.isActive && (
              <Button variant="outline" size="sm" onClick={handleResolve} disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Resolve
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={loading}
            >
              {diagnosis.isActive ? (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ICD-10 Code */}
        {diagnosis.icd10Code && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <FileText className="h-4 w-4 mr-2" />
                ICD-10 Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-lg font-semibold">{diagnosis.icd10Code}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  International Classification of Diseases, 10th Revision
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <User className="h-4 w-4 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Name: </span>
                {diagnosis.patient.firstName} {diagnosis.patient.lastName}
              </div>
              <div>
                <span className="font-medium">Patient ID: </span>
                {diagnosis.patient.patientId}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <FileText className="h-4 w-4 mr-2" />
                Medical Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Title: </span>
                {diagnosis.medicalRecord.title}
              </div>
              <div>
                <span className="font-medium">Record Type: </span>
                {diagnosis.medicalRecord.recordType.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium">Created: </span>
                {formatDate(diagnosis.medicalRecord.createdAt)}
              </div>
              {diagnosis.medicalRecord.doctor && (
                <div>
                  <span className="font-medium">Doctor: </span>
                  Dr. {diagnosis.medicalRecord.doctor.name} ({diagnosis.medicalRecord.doctor.specialization})
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Diagnosis Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <AlertCircle className="h-4 w-4 mr-2" />
              Diagnosis Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium text-sm text-muted-foreground">Type:</span>
                <div className="mt-1">
                  <Badge variant={diagnosisTypeColors[diagnosis.type]}>
                    {diagnosisTypeLabels[diagnosis.type]}
                  </Badge>
                </div>
              </div>
              {diagnosis.severity && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Severity:</span>
                  <div className="mt-1">
                    <Badge variant="outline">{diagnosis.severity}</Badge>
                  </div>
                </div>
              )}
              <div>
                <span className="font-medium text-sm text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant={diagnosis.isActive ? "default" : "secondary"}>
                    {diagnosis.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {diagnosis.resolvedAt && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Resolved:</span>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {formatDate(diagnosis.resolvedAt)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Description:</h4>
              <p className="whitespace-pre-wrap">{diagnosis.description}</p>
            </div>

            {diagnosis.notes && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Additional Notes:</h4>
                <p className="whitespace-pre-wrap">{diagnosis.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Activity className="h-4 w-4 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Diagnosis Created</p>
                  <p className="text-sm text-muted-foreground">Initial diagnosis recorded</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(diagnosis.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Diagnosed Date</p>
                  <p className="text-sm text-muted-foreground">When the condition was identified</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(diagnosis.diagnosedAt)}
                </span>
              </div>

              {diagnosis.updatedAt !== diagnosis.createdAt && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">Most recent modification</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(diagnosis.updatedAt)}
                  </span>
                </div>
              )}

              {diagnosis.resolvedAt && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Diagnosis Resolved</p>
                    <p className="text-sm text-green-600">Condition has been treated/resolved</p>
                  </div>
                  <span className="text-sm text-green-600">
                    {formatDateTime(diagnosis.resolvedAt)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}