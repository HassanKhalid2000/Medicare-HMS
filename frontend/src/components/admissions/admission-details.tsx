'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  UserX,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  FileText,
  Save,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Admission,
  AdmissionStatus,
  admissionStatusLabels,
  admissionStatusColors,
  admissionTypeLabels,
  wardLabels,
  wardColors,
} from '@/types/admission';

interface AdmissionDetailsProps {
  admission: Admission;
  onBack: () => void;
  onEdit: () => void;
}

export function AdmissionDetails({ admission, onBack, onEdit }: AdmissionDetailsProps) {
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDischarge = async () => {
    try {
      setLoading(true);
      const { admissionsService } = await import('@/services/admissions');
      await admissionsService.dischargePatient(admission.id, dischargeSummary);
      setDischargeDialogOpen(false);
      onBack(); // Go back to refresh the list
    } catch (error) {
      console.error('Error discharging patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const lengthOfStay = admission.dischargeDate
    ? Math.ceil(
        (new Date(admission.dischargeDate).getTime() - new Date(admission.admissionDate).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : Math.ceil(
        (new Date().getTime() - new Date(admission.admissionDate).getTime()) /
        (1000 * 60 * 60 * 24)
      );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admission Details
            </h2>
            <p className="text-muted-foreground">
              Comprehensive admission information and patient details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          {admission.status === AdmissionStatus.ADMITTED && (
            <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                  <UserX className="h-4 w-4" />
                  Discharge Patient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Discharge Patient</DialogTitle>
                  <DialogDescription>
                    Please provide a discharge summary for {admission.patient?.firstName} {admission.patient?.lastName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dischargeSummary">Discharge Summary</Label>
                    <Textarea
                      id="dischargeSummary"
                      placeholder="Enter discharge summary, treatment outcomes, follow-up instructions..."
                      value={dischargeSummary}
                      onChange={(e) => setDischargeSummary(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleDischarge}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Processing...' : 'Discharge Patient'}
                    </Button>
                    <Button variant="outline" onClick={() => setDischargeDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">
                {admission.patient?.firstName} {admission.patient?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Patient ID: {admission.patient?.patientId}
              </p>
            </div>

            <div className="space-y-3">
              {admission.patient?.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Born: {format(new Date(admission.patient.dateOfBirth), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}

              {admission.patient?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{admission.patient.phone}</span>
                </div>
              )}

              {admission.patient?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{admission.patient.email}</span>
                </div>
              )}

              {admission.patient?.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{admission.patient.address}</span>
                </div>
              )}

              {admission.patient?.bloodGroup && (
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Blood Type: {admission.patient.bloodGroup}</span>
                </div>
              )}

              {admission.patient?.emergencyContact && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span>Emergency: {admission.patient.emergencyContact}</span>
                </div>
              )}
            </div>

            {admission.patient?.allergyNotes && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-1">⚠️ Allergies</h4>
                <p className="text-sm text-red-700">{admission.patient.allergyNotes}</p>
              </div>
            )}

            {admission.patient?.medicalHistory && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Medical History</h4>
                <p className="text-sm text-blue-700">{admission.patient.medicalHistory}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admission Details */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Admission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Badge
                  variant="secondary"
                  className={`${admissionStatusColors[admission.status]} mt-1`}
                >
                  {admissionStatusLabels[admission.status]}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Badge variant="outline" className="mt-1">
                  {admissionTypeLabels[admission.admissionType]}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Ward</Label>
              <Badge
                variant="secondary"
                className={`${wardColors[admission.ward]} mt-1 text-sm`}
              >
                {wardLabels[admission.ward]}
              </Badge>
            </div>

            {(admission.roomNumber || admission.bedNumber) && (
              <div className="grid grid-cols-2 gap-4">
                {admission.roomNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Room</Label>
                    <p className="text-sm font-medium">{admission.roomNumber}</p>
                  </div>
                )}
                {admission.bedNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Bed</Label>
                    <p className="text-sm font-medium">{admission.bedNumber}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Admission Date</Label>
                <p className="text-sm font-medium">
                  {format(new Date(admission.admissionDate), 'MMM dd, yyyy')}
                </p>
              </div>
              {admission.dischargeDate && (
                <div>
                  <Label className="text-xs text-muted-foreground">Discharge Date</Label>
                  <p className="text-sm font-medium">
                    {format(new Date(admission.dischargeDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Length of Stay</Label>
              <p className="text-sm font-medium">
                {lengthOfStay} day{lengthOfStay !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Created: {format(new Date(admission.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              <p>Updated: {format(new Date(admission.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              Attending Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{admission.doctor?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {admission.doctor?.specialization}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Doctor ID:</span>
                <span>{admission.doctor?.doctorId}</span>
              </div>

              {admission.doctor?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{admission.doctor.phone}</span>
                </div>
              )}

              {admission.doctor?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{admission.doctor.email}</span>
                </div>
              )}

              {admission.doctor?.licenseNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">License:</span>
                  <span>{admission.doctor.licenseNumber}</span>
                </div>
              )}

              {admission.doctor?.experienceYears && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Experience:</span>
                  <span>{admission.doctor.experienceYears} years</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {admission.reason && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Reason for Admission
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">{admission.reason}</p>
            </CardContent>
          </Card>
        )}

        {admission.notes && (
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">{admission.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Discharge Summary */}
      {admission.dischargeSummary && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
          <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Discharge Summary
            </CardTitle>
            <CardDescription>
              Patient was discharged on {admission.dischargeDate && format(new Date(admission.dischargeDate), 'MMM dd, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed">{admission.dischargeSummary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}