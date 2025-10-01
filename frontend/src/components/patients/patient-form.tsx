'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { User, Phone, Calendar, MapPin } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Patient, CreatePatientData, UpdatePatientData } from '@/services/patients';

// Validation schema matching backend DTO
const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePatientData | UpdatePatientData) => Promise<void>;
  patient?: Patient | null;
  loading?: boolean;
}

export function PatientForm({
  open,
  onOpenChange,
  onSubmit,
  patient,
  loading = false
}: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      phone: patient?.phone || '',
      dateOfBirth: patient?.dateOfBirth ?
        (typeof patient.dateOfBirth === 'string' ?
          patient.dateOfBirth.split('T')[0] :
          patient.dateOfBirth.toISOString().split('T')[0]
        ) : '',
      gender: patient?.gender || 'male',
      address: patient?.address || '',
      emergencyContact: patient?.emergencyContact || '',
    },
  });

  const handleSubmit = async (values: PatientFormValues) => {
    const submitData: CreatePatientData | UpdatePatientData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      address: values.address || undefined,
      emergencyContact: values.emergencyContact || undefined,
    };

    await onSubmit(submitData);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
          <DialogDescription>
            {patient
              ? 'Update patient information below.'
              : 'Fill in the patient details to add them to the system.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Enter phone number" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Enter address" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emergency Contact */}
            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {patient ? 'Update Patient' : 'Add Patient'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}