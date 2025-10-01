'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { medicalAlertsApi, AlertSeverity, type CreateMedicalAlertDto } from '@/lib/api/medical-alerts';
import { patientsApi } from '@/lib/api/patients';
import { toast } from 'sonner';

const alertSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  alertType: z.string().min(1, 'Alert type is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  severity: z.nativeEnum(AlertSeverity),
  expiresAt: z.string().optional(),
});

const ALERT_TYPES = [
  'medication_reminder',
  'appointment_followup',
  'lab_results_critical',
  'vital_signs_abnormal',
  'allergy_warning',
  'drug_interaction',
  'chronic_disease_monitoring',
  'vaccination_due',
  'medication_refill',
  'appointment_missed',
];

interface CreateMedicalAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultPatientId?: string;
}

export function CreateMedicalAlertDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultPatientId,
}: CreateMedicalAlertDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);

  const form = useForm<z.infer<typeof alertSchema>>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      patientId: defaultPatientId || '',
      alertType: '',
      title: '',
      message: '',
      severity: AlertSeverity.MEDIUM,
      expiresAt: '',
    },
  });

  const searchPatients = async (query: string) => {
    if (!query || query.length < 2) {
      setPatients([]);
      return;
    }

    try {
      const response = await patientsApi.getAll({ search: query, limit: 10 });
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to search patients:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof alertSchema>) => {
    try {
      setLoading(true);
      await medicalAlertsApi.create(data as CreateMedicalAlertDto);
      toast.success('Medical alert created successfully');
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Medical Alert</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search patient..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          searchPatients(e.target.value);
                        }}
                        disabled={!!defaultPatientId}
                      />
                      {patients.length > 0 && !defaultPatientId && (
                        <div className="border rounded-md max-h-40 overflow-y-auto">
                          {patients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-2 hover:bg-accent cursor-pointer"
                              onClick={() => {
                                field.onChange(patient.id);
                                setSearchQuery(`${patient.firstName} ${patient.lastName}`);
                                setPatients([]);
                              }}
                            >
                              <p className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                MRN: {patient.mrn}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alertType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALERT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
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
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AlertSeverity.LOW}>Low</SelectItem>
                        <SelectItem value={AlertSeverity.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={AlertSeverity.HIGH}>High</SelectItem>
                        <SelectItem value={AlertSeverity.CRITICAL}>Critical</SelectItem>
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
                    <Input placeholder="Alert title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Alert message..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires At (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
