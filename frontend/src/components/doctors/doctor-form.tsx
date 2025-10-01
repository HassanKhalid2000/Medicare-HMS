'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';
import {
  Doctor,
  CreateDoctorData,
  UpdateDoctorData,
  Specialization,
  DoctorStatus,
  specializationLabels,
  statusLabels
} from '@/types/doctor';

const doctorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  specialization: z.nativeEnum(Specialization, {
    required_error: 'Please select a specialization',
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  email: z.string().email('Please enter a valid email address'),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  experienceYears: z.number().min(0, 'Experience years cannot be negative').optional(),
  consultationFee: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid fee amount').optional(),
  status: z.nativeEnum(DoctorStatus).optional(),
  schedule: z.string().optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface DoctorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  onSubmit: (data: CreateDoctorData | UpdateDoctorData) => Promise<void>;
  loading?: boolean;
}

export function DoctorForm({
  open,
  onOpenChange,
  doctor,
  onSubmit,
  loading = false
}: DoctorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!doctor;

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: '',
      specialization: undefined,
      phone: '',
      email: '',
      licenseNumber: '',
      experienceYears: 0,
      consultationFee: '',
      status: DoctorStatus.ACTIVE,
      schedule: '',
    },
  });

  // Reset form when dialog opens/closes or doctor changes
  useEffect(() => {
    if (open) {
      if (isEditing && doctor) {
        form.reset({
          name: doctor.name,
          specialization: doctor.specialization,
          phone: doctor.phone,
          email: doctor.email,
          licenseNumber: doctor.licenseNumber,
          experienceYears: doctor.experienceYears,
          consultationFee: doctor.consultationFee,
          status: doctor.status,
          schedule: doctor.schedule || '',
        });
      } else {
        form.reset({
          name: '',
          specialization: undefined,
          phone: '',
          email: '',
          licenseNumber: '',
          experienceYears: 0,
          consultationFee: '',
          status: DoctorStatus.ACTIVE,
          schedule: '',
        });
      }
    }
  }, [open, doctor, isEditing, form]);

  const handleSubmit = async (values: DoctorFormValues) => {
    try {
      setIsSubmitting(true);

      const submitData: CreateDoctorData | UpdateDoctorData = {
        name: values.name,
        specialization: values.specialization,
        phone: values.phone,
        email: values.email,
        licenseNumber: values.licenseNumber,
        experienceYears: values.experienceYears || 0,
        consultationFee: values.consultationFee || '0.00',
        status: values.status || DoctorStatus.ACTIVE,
        schedule: values.schedule || null,
      };

      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit doctor form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Doctor' : 'Add New Doctor'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the doctor information below.'
              : 'Fill in the details to add a new doctor to the system.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specialization */}
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(specializationLabels).map(([key, label]) => (
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

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doctor@hospital.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* License Number */}
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="LIC123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Years */}
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Consultation Fee */}
              <FormField
                control={form.control}
                name="consultationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Fee ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="150.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the consultation fee in dollars (e.g., 150.00)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
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
                        {Object.entries(statusLabels).map(([key, label]) => (
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

            {/* Schedule */}
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Schedule (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Example: {"monday": "9:00-17:00", "tuesday": "9:00-17:00", "friday": "9:00-13:00"}'
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the work schedule in JSON format. Leave empty if not specified.
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
                {isEditing ? 'Update Doctor' : 'Create Doctor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}