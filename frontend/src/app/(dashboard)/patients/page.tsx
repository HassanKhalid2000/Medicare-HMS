'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  UserPlus,
  Search,
  Phone,
  Calendar,
  MapPin,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PatientForm } from '@/components/patients/patient-form';
import { patientsService, Patient } from '@/services/patients';


export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  // Load patients from API
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const { patientsService } = await import('@/services/patients');
        const response = await patientsService.getPatients({
          search: searchTerm,
          gender: genderFilter || undefined,
        });
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to load patients:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patients. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [searchTerm, genderFilter, refreshKey]);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await patientsService.deletePatient(patientId);
      setRefreshKey(prev => prev + 1);
      toast({
        title: 'Success',
        description: 'Patient deleted successfully.',
      });
    } catch (error) {
      console.error('Failed to delete patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete patient. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitPatient = async (data: any) => {
    try {
      setFormLoading(true);
      if (selectedPatient) {
        await patientsService.updatePatient(selectedPatient.id, data);
        toast({
          title: 'Success',
          description: 'Patient updated successfully.',
        });
      } else {
        await patientsService.createPatient(data);
        toast({
          title: 'Success',
          description: 'Patient created successfully.',
        });
      }

      setShowForm(false);
      setSelectedPatient(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to save patient. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Since filtering is handled by the API, we use patients directly
  const filteredPatients = patients;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient records and information
          </p>
        </div>
        <Button onClick={handleAddPatient} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Patients
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Male Patients
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.gender === 'male').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Male patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Female Patients
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.gender === 'female').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Female patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={genderFilter || "all"} onValueChange={(value) => setGenderFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {patient.patientId}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {patient.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {calculateAge(patient.dateOfBirth)} years
                    </TableCell>
                    <TableCell className="capitalize">
                      {patient.gender}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.emergencyContact || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(patient.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(patient.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPatient(patient)}
                          className="h-8 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePatient(patient.id)}
                          className="h-8 px-2"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No patients found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm || genderFilter
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first patient.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Form Dialog */}
      <PatientForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmitPatient}
        patient={selectedPatient}
        loading={formLoading}
      />
    </div>
  );
}