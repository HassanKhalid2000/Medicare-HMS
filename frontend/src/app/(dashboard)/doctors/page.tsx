'use client';

import { useState } from 'react';
import { DoctorList } from '@/components/doctors/doctor-list';
import { DoctorForm } from '@/components/doctors/doctor-form';
import { DoctorDetail } from '@/components/doctors/doctor-detail';
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
import { useToast } from '@/hooks/use-toast';
import {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData
} from '@/types/doctor';

export default function DoctorsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleCreateDoctor = () => {
    setSelectedDoctor(null);
    setShowForm(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowForm(true);
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDetail(true);
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteDialog(true);
  };

  const handleSubmitDoctor = async (data: CreateDoctorData | UpdateDoctorData) => {
    try {
      setLoading(true);
      const { doctorsService } = await import('@/services/doctors');

      if (selectedDoctor) {
        // Update existing doctor
        await doctorsService.updateDoctor(selectedDoctor.id, data);
        toast({
          title: 'Success',
          description: 'Doctor updated successfully',
        });
      } else {
        // Create new doctor
        await doctorsService.createDoctor(data);
        toast({
          title: 'Success',
          description: 'Doctor created successfully',
        });
      }

      setShowForm(false);
      setSelectedDoctor(null);

      // Refresh doctor list
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Failed to save doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to save doctor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoctor) return;

    try {
      setLoading(true);
      const { doctorsService } = await import('@/services/doctors');

      await doctorsService.deleteDoctor(selectedDoctor.id);

      toast({
        title: 'Success',
        description: 'Doctor deleted successfully',
      });

      setShowDeleteDialog(false);
      setSelectedDoctor(null);

      // Refresh doctor list
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Failed to delete doctor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete doctor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DoctorList
        onCreateDoctor={handleCreateDoctor}
        onEditDoctor={handleEditDoctor}
        onViewDoctor={handleViewDoctor}
        onDeleteDoctor={handleDeleteDoctor}
        refreshKey={refreshKey}
      />

      <DoctorForm
        open={showForm}
        onOpenChange={setShowForm}
        doctor={selectedDoctor}
        onSubmit={handleSubmitDoctor}
        loading={loading}
      />

      <DoctorDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        doctor={selectedDoctor}
        onEdit={handleEditDoctor}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the doctor
              &quot;{selectedDoctor?.name}&quot; and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Doctor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}