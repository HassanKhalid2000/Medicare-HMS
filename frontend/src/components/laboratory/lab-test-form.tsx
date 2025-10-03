'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { laboratoryService, LabTest, TestType, TestUrgency, TestStatus, CreateLabTestDto, UpdateLabTestDto } from '@/services/laboratory';
import { patientsService } from '@/services/patients';
import { doctorsService } from '@/services/doctors';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface LabTestFormProps {
  labTest?: LabTest | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LabTestForm({ labTest, onSuccess, onCancel }: LabTestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: labTest?.patientId || '',
    doctorId: labTest?.doctorId || '',
    testType: labTest?.testType || TestType.BLOOD_TEST,
    urgency: labTest?.urgency || TestUrgency.routine,
    status: labTest?.status || TestStatus.requested,
    sampleInfo: labTest?.sampleInfo || '',
    cost: labTest?.cost || '',
    notes: labTest?.notes || '',
  });

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientsService.getPatients({ page: 1, limit: 100 });
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorsService.getDoctors({ page: 1, limit: 100 });
      setDoctors(response.data);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId) {
      toast.error('Please select both patient and doctor');
      return;
    }

    try {
      setIsLoading(true);

      if (labTest) {
        // Update existing lab test
        const updateData: UpdateLabTestDto = {
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          testType: formData.testType as TestType,
          urgency: formData.urgency as TestUrgency,
          status: formData.status as TestStatus,
          sampleInfo: formData.sampleInfo || undefined,
          cost: formData.cost || undefined,
          notes: formData.notes || undefined,
        };

        await laboratoryService.updateLabTest(labTest.id, updateData);
        toast.success('Lab test updated successfully');
      } else {
        // Create new lab test
        const createData: CreateLabTestDto = {
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          testType: formData.testType as TestType,
          urgency: formData.urgency as TestUrgency,
          sampleInfo: formData.sampleInfo || undefined,
          cost: formData.cost || undefined,
          notes: formData.notes || undefined,
        };

        await laboratoryService.createLabTest(createData);
        toast.success('Lab test created successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save lab test:', error);
      toast.error(error.response?.data?.message || 'Failed to save lab test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient *</Label>
          <Select
            value={formData.patientId}
            onValueChange={(value) => setFormData({ ...formData, patientId: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName} ({patient.patientId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctorId">Doctor *</Label>
          <Select
            value={formData.doctorId}
            onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name} - {doctor.specialization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testType">Test Type *</Label>
          <Select
            value={formData.testType}
            onValueChange={(value) => setFormData({ ...formData, testType: value as TestType })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TestType.BLOOD_TEST}>Blood Test</SelectItem>
              <SelectItem value={TestType.URINE_TEST}>Urine Test</SelectItem>
              <SelectItem value={TestType.X_RAY}>X-Ray</SelectItem>
              <SelectItem value={TestType.CT_SCAN}>CT Scan</SelectItem>
              <SelectItem value={TestType.MRI}>MRI</SelectItem>
              <SelectItem value={TestType.ECG}>ECG</SelectItem>
              <SelectItem value={TestType.ULTRASOUND}>Ultrasound</SelectItem>
              <SelectItem value={TestType.BIOPSY}>Biopsy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency">Urgency</Label>
          <Select
            value={formData.urgency}
            onValueChange={(value) => setFormData({ ...formData, urgency: value as TestUrgency })}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TestUrgency.routine}>Routine</SelectItem>
              <SelectItem value={TestUrgency.urgent}>Urgent</SelectItem>
              <SelectItem value={TestUrgency.stat}>STAT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {labTest && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as TestStatus })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TestStatus.requested}>Requested</SelectItem>
                <SelectItem value={TestStatus.sample_collected}>Sample Collected</SelectItem>
                <SelectItem value={TestStatus.processing}>Processing</SelectItem>
                <SelectItem value={TestStatus.completed}>Completed</SelectItem>
                <SelectItem value={TestStatus.cancelled}>Cancelled</SelectItem>
                <SelectItem value={TestStatus.failed}>Failed</SelectItem>
                <SelectItem value={TestStatus.on_hold}>On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cost">Cost ($)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sampleInfo">Sample Information</Label>
        <Textarea
          id="sampleInfo"
          placeholder="Enter sample collection details..."
          value={formData.sampleInfo}
          onChange={(e) => setFormData({ ...formData, sampleInfo: e.target.value })}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter any additional notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isLoading}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {labTest ? 'Update' : 'Create'} Lab Test
        </Button>
      </div>
    </form>
  );
}
