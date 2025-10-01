'use client';

import { useState } from 'react';
import { AppointmentList } from '@/components/appointments/appointment-list';
import { AppointmentForm } from '@/components/appointments/appointment-form';
import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, UserCog, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  appointmentStatusLabels,
  appointmentStatusColors,
  appointmentTypeLabels
} from '@/types/appointment';

export default function AppointmentsPage() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetail(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteDialog(true);
  };

  const handleSubmitAppointment = async (data: CreateAppointmentData | UpdateAppointmentData) => {
    try {
      setLoading(true);
      const { appointmentsService } = await import('@/services/appointments');

      if (selectedAppointment) {
        // Update existing appointment
        await appointmentsService.updateAppointment(selectedAppointment.id, data);
        toast({
          title: 'Success',
          description: 'Appointment updated successfully',
        });
      } else {
        // Create new appointment
        await appointmentsService.createAppointment(data);
        toast({
          title: 'Success',
          description: 'Appointment scheduled successfully',
        });
      }

      setShowForm(false);
      setSelectedAppointment(null);
      // Refresh appointment list
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Failed to save appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      const { appointmentsService } = await import('@/services/appointments');

      await appointmentsService.deleteAppointment(selectedAppointment.id);

      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully',
      });

      setShowDeleteDialog(false);
      setSelectedAppointment(null);
      // Refresh appointment list
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <>
      {view === 'list' ? (
        <AppointmentList
          onCreateAppointment={handleCreateAppointment}
          onEditAppointment={handleEditAppointment}
          onViewAppointment={handleViewAppointment}
          onDeleteAppointment={handleDeleteAppointment}
          onSwitchToCalendar={() => setView('calendar')}
          refreshKey={refreshKey}
        />
      ) : (
        <AppointmentCalendar
          onCreateAppointment={handleCreateAppointment}
          onEditAppointment={handleEditAppointment}
          onViewAppointment={handleViewAppointment}
          onSwitchToList={() => setView('list')}
        />
      )}

      <AppointmentForm
        open={showForm}
        onOpenChange={setShowForm}
        appointment={selectedAppointment}
        onSubmit={handleSubmitAppointment}
        loading={loading}
      />

      {/* Appointment Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(selectedAppointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(selectedAppointment.appointmentTime)} ({selectedAppointment.duration} min)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {appointmentTypeLabels[selectedAppointment.type]}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={appointmentStatusColors[selectedAppointment.status]}
                  >
                    {appointmentStatusLabels[selectedAppointment.status]}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Patient and Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Patient Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-medium">
                        {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Patient ID: {selectedAppointment.patient?.patientId}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>Phone: {selectedAppointment.patient?.phone}</div>
                      <div>Email: {selectedAppointment.patient?.email}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserCog className="h-5 w-5" />
                      Doctor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-medium">{selectedAppointment.doctor?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedAppointment.doctor?.specialization}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div>Doctor ID: {selectedAppointment.doctor?.doctorId}</div>
                      <div>Fee: ${selectedAppointment.doctor?.consultationFee}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clinical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Clinical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAppointment.symptoms && (
                    <div>
                      <div className="font-medium text-sm mb-1">Symptoms</div>
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {selectedAppointment.symptoms}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.diagnosis && (
                    <div>
                      <div className="font-medium text-sm mb-1">Diagnosis</div>
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {selectedAppointment.diagnosis}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.prescription && (
                    <div>
                      <div className="font-medium text-sm mb-1">Prescription</div>
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {selectedAppointment.prescription}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.notes && (
                    <div>
                      <div className="font-medium text-sm mb-1">Notes</div>
                      <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                        {selectedAppointment.notes}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetail(false);
                    handleEditAppointment(selectedAppointment);
                  }}
                >
                  Edit Appointment
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDetail(false);
                    handleDeleteAppointment(selectedAppointment);
                  }}
                >
                  Cancel Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the appointment for{' '}
              <strong>
                {selectedAppointment?.patient?.firstName} {selectedAppointment?.patient?.lastName}
              </strong>{' '}
              scheduled on{' '}
              <strong>
                {selectedAppointment && formatDate(selectedAppointment.appointmentDate)}
              </strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}