'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pill, User, Calendar, Clock, FileText, AlertTriangle, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Prescription, prescriptionsApi } from '@/lib/api/prescriptions';
import { format } from 'date-fns';

interface PrescriptionDetailsProps {
  prescription: Prescription;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PrescriptionDetails({ prescription, onClose, onUpdate }: PrescriptionDetailsProps) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    try {
      setLoading(true);
      await prescriptionsApi.activatePrescription(prescription.id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error activating prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await prescriptionsApi.deactivatePrescription(prescription.id);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deactivating prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      try {
        setLoading(true);
        await prescriptionsApi.deletePrescription(prescription.id);
        onUpdate();
        onClose();
      } catch (error) {
        console.error('Error deleting prescription:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{prescription.medicine.name}</h2>
          <p className="text-muted-foreground">{prescription.medicine.category} • {prescription.medicine.manufacturer}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={prescription.isActive ? 'default' : 'secondary'}>
            {prescription.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Patient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
            <p className="text-base">{prescription.medicalRecord.patient.firstName} {prescription.medicalRecord.patient.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
            <p className="text-base">{prescription.medicalRecord.patient.patientId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Medical Record</p>
            <p className="text-base">{prescription.medicalRecord.title}</p>
          </div>
          {prescription.medicalRecord.doctor && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Doctor</p>
              <p className="text-base">{prescription.medicalRecord.doctor.name}</p>
              <p className="text-sm text-muted-foreground">{prescription.medicalRecord.doctor.specialization}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescription Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dosage</p>
            <p className="text-base">{prescription.dosage}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Frequency</p>
            <p className="text-base">{prescription.frequency}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Duration</p>
            <p className="text-base">{prescription.duration}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Quantity</p>
            <p className="text-base">{prescription.quantity}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Refills</p>
            <p className="text-base">{prescription.refills}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Prescribed Date</p>
            <p className="text-base">{format(new Date(prescription.prescribedAt), 'MMM dd, yyyy')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions & Warnings */}
      {(prescription.instructions || prescription.warnings) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Instructions & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.instructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Instructions</p>
                <p className="text-base">{prescription.instructions}</p>
              </div>
            )}
            {prescription.warnings && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900 mb-1">Warnings</p>
                    <p className="text-sm text-yellow-800">{prescription.warnings}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medicine Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medicine Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Dosage Information</p>
            <p className="text-base">{prescription.medicine.dosageInfo}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Side Effects</p>
            <p className="text-base">{prescription.medicine.sideEffects}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Interactions</p>
            <p className="text-base">{prescription.medicine.interactions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {prescription.isActive ? (
          <Button variant="outline" onClick={handleDeactivate} disabled={loading}>
            <XCircle className="h-4 w-4 mr-2" />
            Deactivate
          </Button>
        ) : (
          <Button variant="outline" onClick={handleActivate} disabled={loading}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Activate
          </Button>
        )}
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
