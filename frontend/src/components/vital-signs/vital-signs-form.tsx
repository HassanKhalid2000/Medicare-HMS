'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateVitalSignDto, VitalSignType, vitalSignTypeLabels, vitalSignUnits } from '@/types/vital-signs';

const vitalSignSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  type: z.nativeEnum(VitalSignType, { required_error: 'Vital sign type is required' }),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().min(1, 'Unit is required'),
  normalRange: z.string().optional(),
  isAbnormal: z.boolean().optional(),
  notes: z.string().optional(),
  measuredBy: z.string().optional(),
  measuredAt: z.string().optional(),
});

interface VitalSignsFormProps {
  onSubmit: (data: CreateVitalSignDto) => Promise<void>;
  onCancel: () => void;
  initialPatientId?: string;
  isLoading?: boolean;
}

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
}

export function VitalSignsForm({ onSubmit, onCancel, initialPatientId, isLoading }: VitalSignsFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateVitalSignDto>({
    resolver: zodResolver(vitalSignSchema),
    defaultValues: {
      patientId: initialPatientId || '',
      measuredAt: new Date().toISOString().slice(0, 16),
    },
  });

  const selectedType = watch('type');

  // Load patients with search
  useEffect(() => {
    const loadPatients = async () => {
      if (patientSearch.length < 2) return;

      try {
        const { vitalSignsService } = await import('@/services/vital-signs');
        const results = await vitalSignsService.searchPatients(patientSearch);
        setPatients(results);
      } catch (error) {
        console.error('Error loading patients:', error);
        setPatients([]);
      }
    };

    const timeoutId = setTimeout(loadPatients, 300);
    return () => clearTimeout(timeoutId);
  }, [patientSearch]);

  // Auto-set unit when type changes
  useEffect(() => {
    if (selectedType) {
      setValue('unit', vitalSignUnits[selectedType]);
    }
  }, [selectedType, setValue]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setValue('patientId', patient.id);
    setPatientSearch(`${patient.firstName} ${patient.lastName} (${patient.patientId})`);
    setPatients([]);
  };

  const handleFormSubmit = async (data: CreateVitalSignDto) => {
    await onSubmit(data);
    reset();
    setSelectedPatient(null);
    setPatientSearch('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="text-xl font-bold">Record Vital Signs</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <div className="relative">
              <Input
                placeholder="Search patients by name or ID..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full"
                disabled={!!initialPatientId}
              />
              {patients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {patient.patientId} | Phone: {patient.phone}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.patientId && (
              <p className="text-sm text-red-600">{errors.patientId.message}</p>
            )}
          </div>

          {/* Vital Sign Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Vital Sign Type *</Label>
            <Select onValueChange={(value) => setValue('type', value as VitalSignType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vital sign type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(vitalSignTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Value and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                placeholder={selectedType === VitalSignType.BLOOD_PRESSURE ? "120/80" : "Enter value"}
                {...register('value')}
              />
              {errors.value && (
                <p className="text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                {...register('unit')}
                readOnly
                className="bg-gray-50"
              />
              {errors.unit && (
                <p className="text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          {/* Normal Range */}
          <div className="space-y-2">
            <Label htmlFor="normalRange">Normal Range</Label>
            <Input
              id="normalRange"
              placeholder="e.g., 60-100 bpm"
              {...register('normalRange')}
            />
          </div>

          {/* Measured By and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="measuredBy">Measured By</Label>
              <Input
                id="measuredBy"
                placeholder="Staff name"
                {...register('measuredBy')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="measuredAt">Measured At</Label>
              <Input
                id="measuredAt"
                type="datetime-local"
                {...register('measuredAt')}
              />
            </div>
          </div>

          {/* Is Abnormal Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAbnormal"
              onCheckedChange={(checked) => setValue('isAbnormal', !!checked)}
            />
            <Label htmlFor="isAbnormal">Mark as abnormal</Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={3}
              {...register('notes')}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? 'Recording...' : 'Record Vital Signs'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}