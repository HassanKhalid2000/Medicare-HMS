'use client';

import { useState } from 'react';
import { Edit, Trash2, Pill, User, Calendar, Activity, CheckCircle, XCircle, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Prescription, prescriptionsApi } from '@/lib/api/prescriptions';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface PrescriptionDetailsProps {
  prescription: Prescription;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PrescriptionDetails({ prescription, onClose, onUpdate }: PrescriptionDetailsProps) {
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    toast.info('Edit functionality will be implemented in the next phase');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      setLoading(true);
      await prescriptionsApi.deletePrescription(prescription.id);
      toast.success('Prescription deleted successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to delete prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    const action = prescription.isActive ? 'deactivate' : 'activate';
    const confirmMessage = `Are you sure you want to ${action} this prescription?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      if (prescription.isActive) {
        await prescriptionsApi.deactivatePrescription(prescription.id);
        toast.success('Prescription deactivated successfully');
      } else {
        await prescriptionsApi.activatePrescription(prescription.id);
        toast.success('Prescription activated successfully');
      }
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(`Failed to ${action} prescription`);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (prescription.refills <= 0) {
      toast.error('No refills remaining');
      return;
    }

    if (!confirm('Are you sure you want to dispense this prescription? This will reduce the refill count by 1.')) {
      return;
    }

    try {
      setLoading(true);
      await prescriptionsApi.dispensePrescription(prescription.id);
      toast.success('Prescription dispensed successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to dispense prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full">
      <DialogHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Pill className="h-5 w-5" />
              {prescription.medicine.name}
            </DialogTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {prescription.medicalRecord.patient.firstName} {prescription.medicalRecord.patient.lastName}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(prescription.prescribedAt)}
              </div>
              <Badge variant={prescription.isActive ? "default" : "secondary"}>
                {prescription.isActive ? "Active" : "Inactive"}
              </Badge>
              {prescription.refills <= 0 && prescription.isActive && (
                <Badge variant="destructive">No Refills</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {prescription.isActive && prescription.refills > 0 && (
              <Button variant="outline" size="sm" onClick={handleDispense} disabled={loading}>
                <Package className="h-4 w-4 mr-1" />
                Dispense
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={loading}
            >
              {prescription.isActive ? (
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
      </DialogHeader>

      <div className="space-y-6">
        {/* Medicine Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Pill className="h-4 w-4 mr-2" />
              Medicine Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Basic Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name: </span>
                    {prescription.medicine.name}
                  </div>
                  <div>
                    <span className="font-medium">Category: </span>
                    {prescription.medicine.category}
                  </div>
                  <div>
                    <span className="font-medium">Manufacturer: </span>
                    {prescription.medicine.manufacturer}
                  </div>
                  <div>
                    <span className="font-medium">Dosage Info: </span>
                    {prescription.medicine.dosageInfo}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Safety Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Side Effects: </span>
                    <p className="text-sm">{prescription.medicine.sideEffects}</p>
                  </div>
                  {prescription.medicine.interactions && (
                    <div>
                      <span className="font-medium">Known Interactions: </span>
                      <p className="text-sm">{prescription.medicine.interactions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient and Medical Record Information */}
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
                {prescription.medicalRecord.patient.firstName} {prescription.medicalRecord.patient.lastName}
              </div>
              <div>
                <span className="font-medium">Patient ID: </span>
                {prescription.medicalRecord.patient.patientId}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <Activity className="h-4 w-4 mr-2" />
                Medical Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Title: </span>
                {prescription.medicalRecord.title}
              </div>
              <div>
                <span className="font-medium">Record Type: </span>
                {prescription.medicalRecord.recordType.replace('_', ' ')}
              </div>
              <div>
                <span className="font-medium">Created: </span>
                {formatDate(prescription.medicalRecord.createdAt)}
              </div>
              {prescription.medicalRecord.doctor && (
                <div>
                  <span className="font-medium">Doctor: </span>
                  Dr. {prescription.medicalRecord.doctor.name} ({prescription.medicalRecord.doctor.specialization})
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prescription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Package className="h-4 w-4 mr-2" />
              Prescription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium text-sm text-muted-foreground">Dosage:</span>
                <div className="mt-1">
                  <Badge variant="outline">{prescription.dosage}</Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Frequency:</span>
                <div className="mt-1">
                  <Badge variant="outline">{prescription.frequency}</Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Duration:</span>
                <div className="mt-1">
                  <Badge variant="outline">{prescription.duration}</Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Quantity:</span>
                <div className="mt-1">
                  <Badge variant="outline">{prescription.quantity}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-sm text-muted-foreground">Refills Remaining:</span>
                <div className="mt-1">
                  <Badge variant={prescription.refills > 0 ? "default" : "destructive"}>
                    {prescription.refills} refills
                  </Badge>
                </div>
              </div>
              <div>
                <span className="font-medium text-sm text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant={prescription.isActive ? "default" : "secondary"}>
                    {prescription.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {prescription.instructions && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Instructions:</h4>
                <p className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">{prescription.instructions}</p>
              </div>
            )}

            {prescription.warnings && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="font-medium mb-1">Warnings:</div>
                  <p className="whitespace-pre-wrap text-sm">{prescription.warnings}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Prescription Created</p>
                  <p className="text-sm text-muted-foreground">Initial prescription recorded</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(prescription.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Prescribed Date</p>
                  <p className="text-sm text-muted-foreground">When the medication was prescribed</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(prescription.prescribedAt)}
                </span>
              </div>

              {prescription.updatedAt !== prescription.createdAt && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">Most recent modification</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(prescription.updatedAt)}
                  </span>
                </div>
              )}

              {!prescription.isActive && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">Prescription Deactivated</p>
                    <p className="text-sm text-red-600">This prescription is no longer active</p>
                  </div>
                  <span className="text-sm text-red-600">
                    {formatDateTime(prescription.updatedAt)}
                  </span>
                </div>
              )}

              {prescription.refills <= 0 && prescription.isActive && (
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-800">No Refills Remaining</p>
                    <p className="text-sm text-orange-600">Patient needs a new prescription for continued treatment</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}