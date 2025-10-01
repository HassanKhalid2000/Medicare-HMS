'use client';

import { useState } from 'react';
import { Edit, Trash2, FileText, User, Calendar, Clock, Heart, Pill, Stethoscope, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MedicalRecord, medicalRecordsApi } from '@/lib/api/medical-records';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import EditMedicalRecordDialog from './EditMedicalRecordDialog';

interface MedicalRecordDetailsProps {
  record: MedicalRecord;
  onClose: () => void;
  onUpdate: () => void;
}

const recordTypeLabels = {
  VISIT_NOTE: 'Visit Note',
  CONSULTATION: 'Consultation',
  DISCHARGE_SUMMARY: 'Discharge Summary',
  PROGRESS_NOTE: 'Progress Note',
  OPERATIVE_REPORT: 'Operative Report',
  DIAGNOSTIC_REPORT: 'Diagnostic Report',
};

const diagnosisTypeColors = {
  PRIMARY: 'destructive',
  SECONDARY: 'secondary',
  DIFFERENTIAL: 'outline',
  PROVISIONAL: 'default',
  FINAL: 'default',
} as const;

const vitalSignIcons = {
  BLOOD_PRESSURE: Heart,
  HEART_RATE: Heart,
  TEMPERATURE: AlertCircle,
  RESPIRATORY_RATE: Stethoscope,
  OXYGEN_SATURATION: Stethoscope,
  WEIGHT: User,
  HEIGHT: User,
  BMI: User,
  PAIN_SCALE: AlertCircle,
};

export default function MedicalRecordDetails({ record, onClose, onUpdate }: MedicalRecordDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await medicalRecordsApi.deleteMedicalRecord(record.id);
      toast.success('Medical record deleted successfully');
      onUpdate();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete medical record';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full">
      <DialogHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <DialogTitle className="text-xl">{record.title}</DialogTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {record.patient.firstName} {record.patient.lastName}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(record.createdAt)}
              </div>
              <Badge variant="secondary">
                {recordTypeLabels[record.recordType]}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogHeader>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="space-y-6">
            {/* Patient and Doctor Info */}
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
                    {record.patient.firstName} {record.patient.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Patient ID: </span>
                    {record.patient.patientId}
                  </div>
                  {record.patient.dateOfBirth && (
                    <div>
                      <span className="font-medium">Date of Birth: </span>
                      {formatDate(record.patient.dateOfBirth)}
                    </div>
                  )}
                  {record.patient.gender && (
                    <div>
                      <span className="font-medium">Gender: </span>
                      {record.patient.gender}
                    </div>
                  )}
                  {record.patient.bloodGroup && (
                    <div>
                      <span className="font-medium">Blood Group: </span>
                      {record.patient.bloodGroup}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Doctor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Name: </span>
                    Dr. {record.doctor.name}
                  </div>
                  <div>
                    <span className="font-medium">Doctor ID: </span>
                    {record.doctor.doctorId}
                  </div>
                  <div>
                    <span className="font-medium">Specialization: </span>
                    {record.doctor.specialization}
                  </div>
                  {record.doctor.phone && (
                    <div>
                      <span className="font-medium">Phone: </span>
                      {record.doctor.phone}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Appointment Info */}
            {record.appointment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Calendar className="h-4 w-4 mr-2" />
                    Related Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="font-medium">Date: </span>
                      {formatDate(record.appointment.appointmentDate)}
                    </div>
                    <div>
                      <span className="font-medium">Time: </span>
                      {record.appointment.appointmentTime}
                    </div>
                    <div>
                      <span className="font-medium">Type: </span>
                      {record.appointment.type}
                    </div>
                    <div>
                      <span className="font-medium">Status: </span>
                      <Badge variant="outline">{record.appointment.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Record Content */}
            <div className="space-y-4">
              {record.chiefComplaint && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Chief Complaint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.chiefComplaint}</p>
                  </CardContent>
                </Card>
              )}

              {record.historyPresent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">History of Present Illness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.historyPresent}</p>
                  </CardContent>
                </Card>
              )}

              {record.reviewSystems && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Review of Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.reviewSystems}</p>
                  </CardContent>
                </Card>
              )}

              {record.physicalExam && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Physical Examination</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.physicalExam}</p>
                  </CardContent>
                </Card>
              )}

              {record.assessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assessment & Diagnosis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.assessment}</p>
                  </CardContent>
                </Card>
              )}

              {record.plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Treatment Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.plan}</p>
                  </CardContent>
                </Card>
              )}

              {record.followUpInstructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Follow-up Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{record.followUpInstructions}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Record Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Record Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Created: </span>
                    {formatDateTime(record.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated: </span>
                    {formatDateTime(record.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnoses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Diagnoses ({record.diagnoses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.diagnoses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No diagnoses recorded</p>
              ) : (
                <div className="space-y-4">
                  {record.diagnoses.map((diagnosis) => (
                    <div key={diagnosis.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{diagnosis.description}</h4>
                        <Badge variant={diagnosisTypeColors[diagnosis.type]}>
                          {diagnosis.type}
                        </Badge>
                      </div>
                      {diagnosis.icd10Code && (
                        <p className="text-sm text-muted-foreground mb-1">
                          ICD-10: {diagnosis.icd10Code}
                        </p>
                      )}
                      {diagnosis.severity && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Severity: {diagnosis.severity}
                        </p>
                      )}
                      {diagnosis.notes && (
                        <p className="text-sm mt-2">{diagnosis.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Diagnosed: {formatDateTime(diagnosis.diagnosedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Vital Signs ({record.vitalSigns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.vitalSigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No vital signs recorded</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {record.vitalSigns.map((vital) => {
                    const Icon = vitalSignIcons[vital.type] || Heart;
                    return (
                      <div key={vital.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            <span className="font-medium">{vital.type.replace('_', ' ')}</span>
                          </div>
                          {vital.isAbnormal && (
                            <Badge variant="destructive">Abnormal</Badge>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-lg font-semibold">
                            {vital.value} {vital.unit}
                          </p>
                          {vital.normalRange && (
                            <p className="text-sm text-muted-foreground">
                              Normal: {vital.normalRange}
                            </p>
                          )}
                          {vital.notes && (
                            <p className="text-sm mt-1">{vital.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Measured: {formatDateTime(vital.measuredAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-4 w-4 mr-2" />
                Prescriptions ({record.prescriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.prescriptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No prescriptions recorded</p>
              ) : (
                <div className="space-y-4">
                  {record.prescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{prescription.medicine.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {prescription.medicine.category} • {prescription.medicine.manufacturer}
                          </p>
                        </div>
                        <Badge variant={prescription.isActive ? 'default' : 'secondary'}>
                          {prescription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Dosage: </span>
                          {prescription.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Frequency: </span>
                          {prescription.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Duration: </span>
                          {prescription.duration}
                        </div>
                        <div>
                          <span className="font-medium">Quantity: </span>
                          {prescription.quantity}
                        </div>
                      </div>
                      {prescription.instructions && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Instructions: </span>
                          <p className="text-sm">{prescription.instructions}</p>
                        </div>
                      )}
                      {prescription.warnings && (
                        <div className="mt-2">
                          <span className="font-medium text-sm text-red-600">Warnings: </span>
                          <p className="text-sm text-red-600">{prescription.warnings}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Prescribed: {formatDateTime(prescription.prescribedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <EditMedicalRecordDialog
            record={record}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}