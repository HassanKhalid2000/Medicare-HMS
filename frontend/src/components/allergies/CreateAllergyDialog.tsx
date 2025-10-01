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
import { allergiesApi, type CreateAllergyDto } from '@/lib/api/allergies';
import { patientsApi } from '@/lib/api/patients';
import { toast } from 'sonner';

const allergySchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  allergen: z.string().min(1, 'Allergen is required').max(255),
  category: z.string().min(1, 'Category is required'),
  reaction: z.string().min(1, 'Reaction is required'),
  severity: z.string().min(1, 'Severity is required'),
  notes: z.string().optional(),
  diagnosedAt: z.string().optional(),
});

interface CreateAllergyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultPatientId?: string;
}

export function CreateAllergyDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultPatientId,
}: CreateAllergyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const form = useForm<z.infer<typeof allergySchema>>({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      patientId: defaultPatientId || '',
      allergen: '',
      category: '',
      reaction: '',
      severity: '',
      notes: '',
      diagnosedAt: '',
    },
  });

  const searchPatients = async (query: string) => {
    if (!query || query.length < 2) {
      setPatients([]);
      return;
    }

    try {
      setSearchingPatients(true);
      const response = await patientsApi.getAll({
        search: query,
        limit: 10,
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to search patients:', error);
    } finally {
      setSearchingPatients(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof allergySchema>) => {
    try {
      setLoading(true);
      await allergiesApi.createAllergy(data as CreateAllergyDto);
      toast.success('Allergy record created successfully');
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create allergy record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Allergy Record</DialogTitle>
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
                        placeholder="Search patient by name or MRN..."
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
                                setSearchQuery(
                                  `${patient.firstName} ${patient.lastName} (${patient.mrn})`
                                );
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
                name="allergen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergen *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Penicillin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Medication">Medication</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mild">Mild</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Severe">Severe</SelectItem>
                        <SelectItem value="Life-threatening">Life-threatening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosed Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reaction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reaction *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the allergic reaction..."
                      {...field}
                      rows={3}
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
                      placeholder="Any additional information..."
                      {...field}
                      rows={3}
                    />
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
                {loading ? 'Creating...' : 'Create Allergy Record'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
