'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Admission,
  AdmissionType,
  Ward,
  admissionTypeLabels,
  wardLabels,
} from '@/types/admission';

const admissionSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  ward: z.nativeEnum(Ward, { required_error: 'Please select a ward' }),
  roomNumber: z.string().optional(),
  bedNumber: z.string().optional(),
  admissionDate: z.string().min(1, 'Please select admission date'),
  admissionType: z.nativeEnum(AdmissionType, { required_error: 'Please select admission type' }),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof admissionSchema>;

interface AdmissionFormProps {
  admission?: Admission | null;
  onBack: () => void;
  onSaved: () => void;
}

export function AdmissionForm({ admission, onBack, onSaved }: AdmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const isEditing = !!admission;

  const form = useForm<FormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: admission ? {
      patientId: admission.patientId,
      doctorId: admission.doctorId,
      ward: admission.ward,
      roomNumber: admission.roomNumber || '',
      bedNumber: admission.bedNumber || '',
      admissionDate: format(new Date(admission.admissionDate), 'yyyy-MM-dd'),
      admissionType: admission.admissionType,
      reason: admission.reason || '',
      notes: admission.notes || '',
    } : {
      admissionDate: format(new Date(), 'yyyy-MM-dd'),
      ward: undefined,
      admissionType: undefined,
    },
  });

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const { patientsApi } = await import('@/lib/api/patients');
        const response = await patientsApi.getAll({ limit: 100 });
        setPatients(response.data);
      } catch (error) {
        console.error('Error loading patients:', error);
        setPatients([]);
      }
    };
    loadPatients();
  }, []);

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { doctorsApi } = await import('@/lib/api/doctors');
        const response = await doctorsApi.getAll({ limit: 100 });
        setDoctors(response.data);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([]);
      }
    };
    loadDoctors();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const { admissionsService } = await import('@/services/admissions');

      if (isEditing) {
        await admissionsService.updateAdmission(admission!.id, data);
      } else {
        await admissionsService.createAdmission(data);
      }

      onSaved();
    } catch (error) {
      console.error('Error saving admission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isEditing ? 'Edit Admission' : 'New Admission'}
        </h2>
        <p className="text-muted-foreground">
          {isEditing ? 'Update the patient admission record.' : 'Create a new patient admission record.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient & Doctor */}
          <Card>
            <CardHeader>
              <CardTitle>Patient & Doctor</CardTitle>
              <CardDescription>Select the patient and attending doctor</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.patientId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attending Doctor *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card>
            <CardHeader>
              <CardTitle>Admission Details</CardTitle>
              <CardDescription>Configure admission date, type, and ward assignment</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="admissionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(admissionTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(wardLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101, ICU-5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A, B-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Admission reason and additional notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Admission</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the primary reason for admission..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information or special instructions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {loading ? 'Saving...' : isEditing ? 'Update Admission' : 'Create Admission'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
