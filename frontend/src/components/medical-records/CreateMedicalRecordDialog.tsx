'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { medicalRecordsApi, CreateMedicalRecordDto } from '@/lib/api/medical-records';
import { patientsApi } from '@/lib/api/patients';
import { doctorsApi } from '@/lib/api/doctors';
import { appointmentsApi } from '@/lib/api/appointments';
import { toast } from 'sonner';

const medicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  appointmentId: z.string().optional(),
  recordType: z.enum(['VISIT_NOTE', 'CONSULTATION', 'DISCHARGE_SUMMARY', 'PROGRESS_NOTE', 'OPERATIVE_REPORT', 'DIAGNOSTIC_REPORT']),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  chiefComplaint: z.string().optional(),
  historyPresent: z.string().optional(),
  reviewSystems: z.string().optional(),
  physicalExam: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  followUpInstructions: z.string().optional(),
});

type FormData = z.infer<typeof medicalRecordSchema>;

interface CreateMedicalRecordDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
}

const recordTypeOptions = [
  { value: 'VISIT_NOTE', label: 'Visit Note' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'PROGRESS_NOTE', label: 'Progress Note' },
  { value: 'OPERATIVE_REPORT', label: 'Operative Report' },
  { value: 'DIAGNOSTIC_REPORT', label: 'Diagnostic Report' },
];

export default function CreateMedicalRecordDialog({
  onSuccess,
  onCancel,
  patientId: defaultPatientId,
  doctorId: defaultDoctorId,
  appointmentId: defaultAppointmentId,
}: CreateMedicalRecordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: defaultPatientId || '',
      doctorId: defaultDoctorId || '',
      appointmentId: defaultAppointmentId || '',
      recordType: 'VISIT_NOTE',
      title: '',
      chiefComplaint: '',
      historyPresent: '',
      reviewSystems: '',
      physicalExam: '',
      assessment: '',
      plan: '',
      followUpInstructions: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        const [patientsResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
          patientsApi.getAll({ page: 1, limit: 100 }),
          doctorsApi.getAll({ page: 1, limit: 100 }),
          appointmentsApi.getAll({ page: 1, limit: 100 }),
        ]);

        setPatients(patientsResponse.data);
        setDoctors(doctorsResponse.data);
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        toast.error('Failed to load required data');
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const createData: CreateMedicalRecordDto = {
        ...data,
        appointmentId: data.appointmentId && data.appointmentId !== 'none' ? data.appointmentId : undefined,
      };

      await medicalRecordsApi.createMedicalRecord(createData);
      toast.success('Medical record created successfully');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create medical record';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>Create New Medical Record</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
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
                <FormLabel>Doctor *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} ({doctor.specialization})
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
            name="appointmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Appointment (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No appointment</SelectItem>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()} - {appointment.appointmentTime}
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
            name="recordType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Record Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {recordTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter record title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chiefComplaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chief Complaint</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Patient's main concern or reason for visit"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="historyPresent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>History of Present Illness</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the current illness"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reviewSystems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review of Systems</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Systematic review of body systems"
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
            name="physicalExam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Examination</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Physical examination findings"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assessment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assessment & Diagnosis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Clinical assessment and differential diagnosis"
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
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Plan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Treatment plan and recommendations"
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
          name="followUpInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Follow-up Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instructions for patient follow-up"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Medical Record'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}