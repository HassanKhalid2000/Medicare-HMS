'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Search } from 'lucide-react';
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
import {  Prescription, Medicine, prescriptionsApi } from '@/lib/api/prescriptions';

const prescriptionSchema = z.object({
  medicalRecordId: z.string().min(1, 'Please select a medical record'),
  medicineId: z.string().min(1, 'Please select a medicine'),
  dosage: z.string().min(1, 'Please enter dosage'),
  frequency: z.string().min(1, 'Please enter frequency'),
  duration: z.string().min(1, 'Please enter duration'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  refills: z.number().min(0, 'Refills must be at least 0').max(11, 'Refills cannot exceed 11'),
  instructions: z.string().optional(),
  warnings: z.string().optional(),
  prescribedAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

type FormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  onBack: () => void;
  onSaved: () => void;
}

export function PrescriptionForm({ prescription, onBack, onSaved }: PrescriptionFormProps) {
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');

  const isEditing = !!prescription;

  const form = useForm<FormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: prescription ? {
      medicalRecordId: prescription.medicalRecordId,
      medicineId: prescription.medicineId,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      quantity: prescription.quantity,
      refills: prescription.refills,
      instructions: prescription.instructions || '',
      warnings: prescription.warnings || '',
      prescribedAt: prescription.prescribedAt ? format(new Date(prescription.prescribedAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      isActive: prescription.isActive,
    } : {
      medicalRecordId: '',
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 1,
      refills: 0,
      instructions: '',
      warnings: '',
      prescribedAt: format(new Date(), 'yyyy-MM-dd'),
      isActive: true,
    },
  });

  // Load medical records
  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        const { medicalRecordsApi } = await import('@/lib/api/medical-records');
        const response = await medicalRecordsApi.getMedicalRecords({ limit: 100 });
        setMedicalRecords(response.data);
      } catch (error) {
        console.error('Error loading medical records:', error);
        setMedicalRecords([]);
      }
    };
    loadMedicalRecords();
  }, []);

  // Load all medicines
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const results = await prescriptionsApi.searchMedicines('', 100);
        setAllMedicines(results);
        setMedicines(results);
      } catch (error) {
        console.error('Error loading medicines:', error);
        setAllMedicines([]);
        setMedicines([]);
      }
    };
    loadMedicines();
  }, []);

  // Filter medicines based on search
  useEffect(() => {
    if (medicineSearch.trim() === '') {
      setMedicines(allMedicines);
    } else {
      const searchLower = medicineSearch.toLowerCase();
      const filtered = allMedicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchLower) ||
          medicine.category.toLowerCase().includes(searchLower) ||
          medicine.manufacturer.toLowerCase().includes(searchLower)
      );
      setMedicines(filtered);
    }
  }, [medicineSearch, allMedicines]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Convert date string to ISO DateTime format
      const prescriptionData = {
        ...data,
        prescribedAt: data.prescribedAt ? new Date(data.prescribedAt).toISOString() : new Date().toISOString(),
      };

      if (isEditing) {
        await prescriptionsApi.updatePrescription(prescription!.id, prescriptionData);
      } else {
        await prescriptionsApi.createPrescription(prescriptionData);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Prescription' : 'New Prescription'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing ? 'Update the prescription details.' : 'Create a new prescription record.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Medical Record & Medicine */}
          <Card>
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
              <CardDescription>Select the medical record and medicine</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="medicalRecordId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Record *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select medical record..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicalRecords.map((record) => (
                          <SelectItem key={record.id} value={record.id}>
                            {record.patient?.firstName} {record.patient?.lastName} - {record.title}
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
                    <div className="relative">
                      <Input
                        list="medicines-list"
                        placeholder="Type to search or select from dropdown..."
                        value={medicines.find(m => m.id === field.value)?.name || medicineSearch}
                        onChange={(e) => {
                          setMedicineSearch(e.target.value);
                          const medicine = medicines.find(m => m.name === e.target.value);
                          if (medicine) {
                            field.onChange(medicine.id);
                          }
                        }}
                        className="pr-10"
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <datalist id="medicines-list">
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.name}>
                            {medicine.category} - {medicine.manufacturer}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} available
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 500mg" {...field} />
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
                    <FormControl>
                      <Input placeholder="e.g., Twice daily" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 7 days" {...field} />
                    </FormControl>
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
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    <FormLabel>Refills *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Instructions and warnings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter usage instructions..."
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
                name="warnings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warnings</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any warnings or precautions..."
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
              {loading ? 'Saving...' : isEditing ? 'Update Prescription' : 'Create Prescription'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
