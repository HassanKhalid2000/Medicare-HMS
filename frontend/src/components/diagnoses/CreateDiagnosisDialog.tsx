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
import { DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { diagnosesApi, CreateDiagnosisDto, ICD10Code } from '@/lib/api/diagnoses';
import { medicalRecordsApi } from '@/lib/api/medical-records';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const diagnosisSchema = z.object({
  medicalRecordId: z.string().min(1, 'Medical record is required'),
  icd10Code: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  type: z.enum(['PRIMARY', 'SECONDARY', 'DIFFERENTIAL', 'PROVISIONAL', 'FINAL']),
  notes: z.string().optional(),
  diagnosedAt: z.string().optional(),
  severity: z.string().optional(),
});

type FormData = z.infer<typeof diagnosisSchema>;

interface CreateDiagnosisDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultMedicalRecordId?: string;
}

const diagnosisTypeOptions = [
  { value: 'PRIMARY', label: 'Primary', description: 'Main condition being treated' },
  { value: 'SECONDARY', label: 'Secondary', description: 'Additional conditions present' },
  { value: 'DIFFERENTIAL', label: 'Differential', description: 'Possible diagnosis to rule out' },
  { value: 'PROVISIONAL', label: 'Provisional', description: 'Tentative diagnosis pending further tests' },
  { value: 'FINAL', label: 'Final', description: 'Confirmed diagnosis' },
];

const severityOptions = [
  'Mild',
  'Moderate',
  'Severe',
  'Critical',
  'Stable',
  'Acute',
  'Chronic',
];

export default function CreateDiagnosisDialog({
  onSuccess,
  onCancel,
  defaultMedicalRecordId,
}: CreateDiagnosisDialogProps) {
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [icd10Codes, setIcd10Codes] = useState<ICD10Code[]>([]);
  const [icd10Search, setIcd10Search] = useState('');
  const [icd10Open, setIcd10Open] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchingICD10, setSearchingICD10] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      medicalRecordId: defaultMedicalRecordId || '',
      icd10Code: '',
      description: '',
      type: 'PRIMARY',
      notes: '',
      diagnosedAt: new Date().toISOString().split('T')[0],
      severity: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const response = await medicalRecordsApi.getMedicalRecords({ page: 1, limit: 100 });
        setMedicalRecords(response.data);
      } catch (error) {
        toast.error('Failed to load medical records');
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const searchICD10 = async () => {
      if (icd10Search.length < 2) {
        setIcd10Codes([]);
        return;
      }

      try {
        setSearchingICD10(true);
        const results = await diagnosesApi.searchICD10Codes(icd10Search, 20);
        setIcd10Codes(results);
      } catch (error) {
        console.error('Failed to search ICD-10 codes:', error);
      } finally {
        setSearchingICD10(false);
      }
    };

    const timeoutId = setTimeout(searchICD10, 300);
    return () => clearTimeout(timeoutId);
  }, [icd10Search]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const createData: CreateDiagnosisDto = {
        ...data,
        diagnosedAt: data.diagnosedAt || undefined,
        icd10Code: data.icd10Code || undefined,
        notes: data.notes || undefined,
        severity: data.severity && data.severity !== 'none' ? data.severity : undefined,
      };

      await diagnosesApi.createDiagnosis(createData);
      toast.success('Diagnosis created successfully');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create diagnosis';
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
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="medicalRecordId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Record *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select medical record" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {medicalRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.title} - {record.patient.firstName} {record.patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {diagnosisTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
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
                  <FormLabel>Severity (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {severityOptions.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {severity}
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
            name="icd10Code"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>ICD-10 Code (Optional)</FormLabel>
                <Popover open={icd10Open} onOpenChange={setIcd10Open}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <span className="truncate">
                            {icd10Codes.find(code => code.code === field.value)?.display || field.value}
                          </span>
                        ) : (
                          "Search ICD-10 codes..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search ICD-10 codes..."
                        value={icd10Search}
                        onValueChange={setIcd10Search}
                      />
                      <CommandList>
                        {searchingICD10 && (
                          <CommandEmpty>Searching...</CommandEmpty>
                        )}
                        {!searchingICD10 && icd10Codes.length === 0 && icd10Search.length >= 2 && (
                          <CommandEmpty>No ICD-10 codes found.</CommandEmpty>
                        )}
                        {!searchingICD10 && icd10Codes.length === 0 && icd10Search.length < 2 && (
                          <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
                        )}
                        <CommandGroup>
                          {icd10Codes.map((code) => (
                            <CommandItem
                              key={code.code}
                              value={code.code}
                              onSelect={(value) => {
                                field.onChange(value === field.value ? "" : value);
                                setIcd10Open(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === code.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{code.code}</span>
                                <span className="text-sm text-muted-foreground">{code.description}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the diagnosis or condition"
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

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes or observations about the diagnosis"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Diagnosis'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}