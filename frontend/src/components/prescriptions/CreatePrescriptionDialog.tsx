'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { prescriptionsApi, CreatePrescriptionDto, Medicine, DrugInteraction } from '@/lib/api/prescriptions';
import { medicalRecordsApi } from '@/lib/api/medical-records';
import { Check, ChevronsUpDown, AlertTriangle, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const prescriptionSchema = z.object({
  medicalRecordId: z.string().min(1, 'Medical record is required'),
  medicineId: z.string().min(1, 'Medicine is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  refills: z.number().min(0, 'Refills cannot be negative').max(11, 'Maximum 11 refills allowed'),
  instructions: z.string().optional(),
  warnings: z.string().optional(),
  prescribedAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof prescriptionSchema>;

interface CreatePrescriptionDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultMedicalRecordId?: string;
}

const frequencyOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
  'Before meals',
  'After meals',
  'At bedtime',
];

const durationOptions = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '14 days',
  '21 days',
  '30 days',
  '60 days',
  '90 days',
  'Ongoing',
  'As directed',
];

export default function CreatePrescriptionDialog({
  onSuccess,
  onCancel,
  defaultMedicalRecordId,
}: CreatePrescriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineOpen, setMedicineOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchingMedicines, setSearchingMedicines] = useState(false);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      medicalRecordId: defaultMedicalRecordId || '',
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 30,
      refills: 3,
      instructions: '',
      warnings: '',
      prescribedAt: new Date().toISOString().split('T')[0],
      isActive: true,
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
    const searchMedicines = async () => {
      if (medicineSearch.length < 2) {
        setMedicines([]);
        return;
      }

      try {
        setSearchingMedicines(true);
        const results = await prescriptionsApi.searchMedicines(medicineSearch, 20);
        setMedicines(results);
      } catch (error) {
        console.error('Failed to search medicines:', error);
      } finally {
        setSearchingMedicines(false);
      }
    };

    const timeoutId = setTimeout(searchMedicines, 500);
    return () => clearTimeout(timeoutId);
  }, [medicineSearch]);

  const checkDrugInteractions = async (medicineId: string) => {
    const medicalRecordId = form.getValues('medicalRecordId');
    if (!medicalRecordId || !medicineId) return;

    try {
      setCheckingInteractions(true);
      // Get existing prescriptions for the patient
      const medicalRecord = medicalRecords.find(mr => mr.id === medicalRecordId);
      if (!medicalRecord) return;

      const existingPrescriptions = await prescriptionsApi.getPatientPrescriptions(
        medicalRecord.patient.id,
        { isActive: true }
      );

      const medicineIds = [
        ...existingPrescriptions.data.map(p => p.medicineId),
        medicineId
      ];

      if (medicineIds.length > 1) {
        const interactions = await prescriptionsApi.checkDrugInteractions(medicineIds);
        setDrugInteractions(interactions);
      }
    } catch (error) {
      console.error('Failed to check drug interactions:', error);
    } finally {
      setCheckingInteractions(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const createData: CreatePrescriptionDto = {
        ...data,
        prescribedAt: data.prescribedAt || undefined,
        instructions: data.instructions || undefined,
        warnings: data.warnings || undefined,
      };

      await prescriptionsApi.createPrescription(createData);
      toast.success('Prescription created successfully');
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create prescription';
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto px-1">
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

          <FormField
            control={form.control}
            name="medicineId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Medicine *</FormLabel>
                <Popover open={medicineOpen} onOpenChange={setMedicineOpen}>
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
                            {medicines.find(medicine => medicine.id === field.value)?.name || 'Unknown medicine'}
                          </span>
                        ) : (
                          "Search medicines..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search medicines..."
                        value={medicineSearch}
                        onValueChange={setMedicineSearch}
                      />
                      <CommandList>
                        {searchingMedicines && (
                          <CommandEmpty>Searching...</CommandEmpty>
                        )}
                        {!searchingMedicines && medicines.length === 0 && medicineSearch.length >= 2 && (
                          <CommandEmpty>No medicines found.</CommandEmpty>
                        )}
                        {!searchingMedicines && medicines.length === 0 && medicineSearch.length < 2 && (
                          <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
                        )}
                        <CommandGroup>
                          {medicines.map((medicine) => (
                            <CommandItem
                              key={medicine.id}
                              value={medicine.id}
                              onSelect={(value) => {
                                field.onChange(value === field.value ? "" : value);
                                setMedicineOpen(false);
                                if (value !== field.value) {
                                  checkDrugInteractions(value);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === medicine.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{medicine.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {medicine.category} • {medicine.manufacturer}
                                </span>
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

          {/* Drug Interactions Warning */}
          {drugInteractions.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-medium mb-2">Drug Interactions Detected:</div>
                {drugInteractions.map((interaction, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        interaction.severity === 'MAJOR' || interaction.severity === 'CONTRAINDICATED'
                          ? 'destructive'
                          : interaction.severity === 'MODERATE'
                          ? 'default'
                          : 'secondary'
                      }>
                        {interaction.severity}
                      </Badge>
                      <span className="text-sm">
                        {interaction.medicine1.name} + {interaction.medicine2.name}
                      </span>
                    </div>
                    <p className="text-sm">{interaction.description}</p>
                    <p className="text-sm font-medium">Recommendation: {interaction.recommendation}</p>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 500mg, 1 tablet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map((frequency) => (
                        <SelectItem key={frequency} value={frequency}>
                          {frequency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refills</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="11"
                      placeholder="3"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="prescribedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prescribed Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Special instructions for the patient"
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
            name="warnings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warnings</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Important warnings or precautions"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || checkingInteractions}>
            {loading ? 'Creating...' : 'Create Prescription'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}