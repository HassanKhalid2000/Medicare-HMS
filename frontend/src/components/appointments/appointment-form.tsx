'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarDays, Clock, User, UserCog } from 'lucide-react';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentType,
  AppointmentStatus,
  appointmentTypeLabels,
  appointmentStatusLabels,
  TimeSlot
} from '@/types/appointment';

const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  doctorId: z.string().min(1, 'Please select a doctor'),
  appointmentDate: z.date({
    required_error: 'Please select an appointment date',
  }),
  appointmentTime: z.string().min(1, 'Please select an appointment time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration cannot exceed 3 hours'),
  type: z.nativeEnum(AppointmentType, {
    required_error: 'Please select an appointment type',
  }),
  status: z.nativeEnum(AppointmentStatus).optional(),
  notes: z.string().optional(),
  symptoms: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSubmit: (data: CreateAppointmentData | UpdateAppointmentData) => Promise<void>;
  loading?: boolean;
}

export function AppointmentForm({
  open,
  onOpenChange,
  appointment,
  onSubmit,
  loading = false
}: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const isEditing = !!appointment;

  const [patients, setPatients] = useState<Array<{ id: string; patientId: string; name: string; phone: string }>>([]);

  const [doctors, setDoctors] = useState<Array<{ id: string; doctorId: string; name: string; specialization: string }>>([]);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      appointmentDate: undefined,
      appointmentTime: '',
      duration: 30,
      type: undefined,
      status: AppointmentStatus.SCHEDULED,
      notes: '',
      symptoms: '',
    },
  });

  // Load patients and doctors from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load patients using service
        const { patientsService } = await import('@/services/patients');
        const patientsResponse = await patientsService.getPatients();
        // Transform patient data to match expected format for form
        const transformedPatients = patientsResponse.data.map((patient) => ({
          id: patient.id,
          patientId: patient.patientId,
          name: `${patient.firstName} ${patient.lastName}`,
          phone: patient.phone
        }));
        setPatients(transformedPatients);

        // Load doctors using service
        const { doctorsService } = await import('@/services/doctors');
        const doctorsResponse = await doctorsService.getDoctors();
        // Transform doctor data to match expected format for form
        const transformedDoctors = doctorsResponse.data.map((doctor) => ({
          id: doctor.id,
          doctorId: doctor.doctorId,
          name: doctor.name,
          specialization: doctor.specialization
        }));
        setDoctors(transformedDoctors);
      } catch (error) {
        console.error('Failed to load patients and doctors:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Reset form when dialog opens/closes or appointment changes
  useEffect(() => {
    if (open) {
      if (isEditing && appointment) {
        const appointmentTime = new Date(appointment.appointmentTime);
        const timeString = `${appointmentTime.getHours().toString().padStart(2, '0')}:${appointmentTime.getMinutes().toString().padStart(2, '0')}`;

        form.reset({
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentDate: new Date(appointment.appointmentDate),
          appointmentTime: timeString,
          duration: appointment.duration,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes || '',
          symptoms: appointment.symptoms || '',
        });
      } else {
        form.reset({
          patientId: '',
          doctorId: '',
          appointmentDate: undefined,
          appointmentTime: '',
          duration: 30,
          type: undefined,
          status: AppointmentStatus.SCHEDULED,
          notes: '',
          symptoms: '',
        });
      }
    }
  }, [open, appointment, isEditing, form]);

  const handleSubmit = async (values: AppointmentFormValues) => {
    try {
      setIsSubmitting(true);

      // Format date without timezone conversion
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const submitData: CreateAppointmentData | UpdateAppointmentData = {
        patientId: values.patientId,
        doctorId: values.doctorId,
        appointmentDate: formatDateForAPI(values.appointmentDate), // Convert Date to "YYYY-MM-DD" without timezone issues
        appointmentTime: values.appointmentTime, // Keep as time string format "HH:MM"
        duration: values.duration,
        type: values.type,
        status: values.status || AppointmentStatus.SCHEDULED,
        notes: values.notes || '',
        symptoms: values.symptoms || '',
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit appointment form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedDate = form.watch('appointmentDate');
  const watchedDoctor = form.watch('doctorId');

  // Load available time slots when date/doctor changes
  useEffect(() => {
    const loadTimeSlots = async () => {
      if (watchedDate && watchedDoctor) {
        try {
          setLoadingTimeSlots(true);
          const { appointmentsService } = await import('@/services/appointments');
          const dateString = watchedDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
          const response = await appointmentsService.getAvailableTimeSlots(watchedDoctor, dateString);
          setAvailableTimeSlots(response || []);
        } catch (error) {
          console.error('Failed to load time slots:', error);
          // Fallback to empty slots or default slots
          setAvailableTimeSlots([]);
        } finally {
          setLoadingTimeSlots(false);
        }
      } else {
        // Clear time slots if date or doctor not selected
        setAvailableTimeSlots([]);
      }
    };

    loadTimeSlots();
  }, [watchedDate, watchedDoctor]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the appointment details below.'
              : 'Fill in the details to schedule a new appointment.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Selection */}
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Patient
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            <div className="flex flex-col">
                              <span>{patient.name}</span>
                              <span className="text-xs text-muted-foreground">{patient.patientId}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Doctor Selection */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Doctor
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex flex-col">
                              <span>{doctor.name}</span>
                              <span className="text-xs text-muted-foreground">{doctor.specialization}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Date */}
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Time */}
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchedDate || !watchedDoctor || loadingTimeSlots}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            loadingTimeSlots ? 'Loading...' : 'Select time'
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem
                            key={slot.time}
                            value={slot.time}
                            disabled={!slot.available}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{slot.time}</span>
                              {!slot.available && (
                                <span className="text-xs text-red-500 ml-2">Booked</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {!watchedDate || !watchedDoctor ?
                        'Select date and doctor first' :
                        'Available time slots for selected date and doctor'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(appointmentTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status (for editing) */}
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(appointmentStatusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Symptoms */}
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the patient's symptoms or concerns..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the patient's current symptoms or reason for visit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes or special instructions..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Special instructions, preparation requirements, or other relevant information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? 'Update Appointment' : 'Schedule Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}