'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ArrowLeft, Save, Search, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Admission,
  Ward,
  AdmissionType,
  wardLabels,
  admissionTypeLabels,
} from '@/types/admission';

const admissionSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  ward: z.nativeEnum(Ward, { required_error: 'Ward is required' }),
  roomNumber: z.string().optional(),
  bedNumber: z.string().optional(),
  admissionDate: z.string().min(1, 'Admission date is required'),
  admissionType: z.nativeEnum(AdmissionType, { required_error: 'Admission type is required' }),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof admissionSchema>;

interface AdmissionFormProps {
  admission?: Admission | null;
  onBack: () => void;
  onSaved: () => void;
}

export function AdmissionForm({ admission, onBack, onSaved }: AdmissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [patientOpen, setPatientOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);

  const isEditing = !!admission;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(admissionSchema),
    defaultValues: admission ? {
      patientId: admission.patientId,
      doctorId: admission.doctorId,
      ward: admission.ward,
      roomNumber: admission.roomNumber || '',
      bedNumber: admission.bedNumber || '',
      admissionDate: format(new Date(admission.admissionDate), 'yyyy-MM-dd'),
      admissionType: admission.admissionType,
      reason: admission.reason || '',
      notes: admission.notes || '',
    } : {
      admissionDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const selectedPatientId = watch('patientId');
  const selectedDoctorId = watch('doctorId');

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      if (patientSearch.length < 2) return;
      try {
        const { admissionsService } = await import('@/services/admissions');
        const results = await admissionsService.searchPatients(patientSearch);
        setPatients(results);
      } catch (error) {
        console.error('Error loading patients:', error);
        setPatients([]);
      }
    };

    const timeoutId = setTimeout(loadPatients, 300);
    return () => clearTimeout(timeoutId);
  }, [patientSearch]);

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      if (doctorSearch.length < 2) return;
      try {
        const { admissionsService } = await import('@/services/admissions');
        const results = await admissionsService.searchDoctors(doctorSearch);
        setDoctors(results);
      } catch (error) {
        console.error('Error loading doctors:', error);
        setDoctors([]);
      }
    };

    const timeoutId = setTimeout(loadDoctors, 300);
    return () => clearTimeout(timeoutId);
  }, [doctorSearch]);

  // Load initial data for editing
  useEffect(() => {
    if (admission) {
      if (admission.patient) {
        setPatients([admission.patient]);
        setPatientSearch(`${admission.patient.firstName} ${admission.patient.lastName}`);
      }
      if (admission.doctor) {
        setDoctors([admission.doctor]);
        setDoctorSearch(admission.doctor.name);
      }
    }
  }, [admission]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const { admissionsService } = await import('@/services/admissions');

      if (isEditing && admission) {
        await admissionsService.updateAdmission(admission.id, data);
      } else {
        await admissionsService.createAdmission(data);
      }

      onSaved();
    } catch (error) {
      console.error('Error saving admission:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'Edit Admission' : 'New Admission'}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? 'Update admission details and information.' : 'Create a new patient admission record.'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient and Doctor Selection */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle>Patient & Doctor</CardTitle>
              <CardDescription>Select the patient and attending doctor</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={patientOpen}
                      className="w-full justify-between"
                    >
                      {selectedPatient
                        ? `${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.patientId})`
                        : "Select patient..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search patients..."
                        value={patientSearch}
                        onValueChange={setPatientSearch}
                      />
                      <CommandEmpty>
                        {patientSearch.length < 2 ? 'Type to search patients...' : 'No patients found.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.id}
                            onSelect={() => {
                              setValue('patientId', patient.id);
                              setPatientOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPatientId === patient.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {patient.patientId} • {patient.phone}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.patientId && (
                  <p className="text-sm text-red-600">{errors.patientId.message}</p>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label htmlFor="doctor">Attending Doctor *</Label>
                <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={doctorOpen}
                      className="w-full justify-between"
                    >
                      {selectedDoctor
                        ? `${selectedDoctor.name} (${selectedDoctor.specialization})`
                        : "Select doctor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search doctors..."
                        value={doctorSearch}
                        onValueChange={setDoctorSearch}
                      />
                      <CommandEmpty>
                        {doctorSearch.length < 2 ? 'Type to search doctors...' : 'No doctors found.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {doctors.map((doctor) => (
                          <CommandItem
                            key={doctor.id}
                            value={doctor.id}
                            onSelect={() => {
                              setValue('doctorId', doctor.id);
                              setDoctorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedDoctorId === doctor.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">{doctor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {doctor.specialization} • {doctor.doctorId}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.doctorId && (
                  <p className="text-sm text-red-600">{errors.doctorId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle>Admission Details</CardTitle>
              <CardDescription>Configure admission date, type, and ward assignment</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionDate">Admission Date *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    {...register('admissionDate')}
                  />
                  {errors.admissionDate && (
                    <p className="text-sm text-red-600">{errors.admissionDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissionType">Admission Type *</Label>
                  <Select onValueChange={(value) => setValue('admissionType', value as AdmissionType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(admissionTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.admissionType && (
                    <p className="text-sm text-red-600">{errors.admissionType.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Ward *</Label>
                <Select onValueChange={(value) => setValue('ward', value as Ward)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(wardLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ward && (
                  <p className="text-sm text-red-600">{errors.ward.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g., 101, ICU-5"
                    {...register('roomNumber')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bedNumber">Bed Number</Label>
                  <Input
                    id="bedNumber"
                    placeholder="e.g., A, B-1"
                    {...register('bedNumber')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle>Medical Information</CardTitle>
            <CardDescription>Reason for admission and clinical notes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Admission</Label>
              <Textarea
                id="reason"
                placeholder="Describe the medical condition or reason for admission..."
                {...register('reason')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional clinical observations, treatment plans, or special instructions..."
                {...register('notes')}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : isEditing ? 'Update Admission' : 'Create Admission'}
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}