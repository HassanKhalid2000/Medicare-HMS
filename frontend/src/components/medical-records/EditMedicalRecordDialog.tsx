'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { medicalRecordsApi, UpdateMedicalRecordDto, MedicalRecord } from '@/lib/api/medical-records';
import { toast } from 'sonner';

const medicalRecordSchema = z.object({
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

interface EditMedicalRecordDialogProps {
  record: MedicalRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

const recordTypeOptions = [
  { value: 'VISIT_NOTE', label: 'Visit Note' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'PROGRESS_NOTE', label: 'Progress Note' },
  { value: 'OPERATIVE_REPORT', label: 'Operative Report' },
  { value: 'DIAGNOSTIC_REPORT', label: 'Diagnostic Report' },
];

export default function EditMedicalRecordDialog({
  record,
  onSuccess,
  onCancel,
}: EditMedicalRecordDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      recordType: record.recordType,
      title: record.title,
      chiefComplaint: record.chiefComplaint || '',
      historyPresent: record.historyPresent || '',
      reviewSystems: record.reviewSystems || '',
      physicalExam: record.physicalExam || '',
      assessment: record.assessment || '',
      plan: record.plan || '',
      followUpInstructions: record.followUpInstructions || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const updateData: UpdateMedicalRecordDto = {
        ...data,
      };

      await medicalRecordsApi.updateMedicalRecord(record.id, updateData);
      toast.success('Medical record updated successfully');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update medical record';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Medical Record</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

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
            {loading ? 'Updating...' : 'Update Medical Record'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}