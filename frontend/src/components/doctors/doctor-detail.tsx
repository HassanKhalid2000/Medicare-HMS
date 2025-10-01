'use client';

import { useState } from 'react';
import { Calendar, Clock, Mail, Phone, FileText, User, Award, DollarSign, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Doctor,
  specializationLabels,
  statusLabels
} from '@/types/doctor';

interface DoctorDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: Doctor | null;
  onEdit?: (doctor: Doctor) => void;
}

export function DoctorDetail({
  open,
  onOpenChange,
  doctor,
  onEdit
}: DoctorDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!doctor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const parseSchedule = (scheduleStr: string | null) => {
    if (!scheduleStr) return null;
    try {
      return JSON.parse(scheduleStr);
    } catch {
      return null;
    }
  };

  const schedule = parseSchedule(doctor.schedule);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{doctor.name}</DialogTitle>
              <DialogDescription className="text-lg">
                {specializationLabels[doctor.specialization]} • Doctor ID: {doctor.doctorId}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={getStatusColor(doctor.status)}
              >
                {statusLabels[doctor.status]}
              </Badge>
              {onEdit && (
                <Button onClick={() => onEdit(doctor)} size="sm">
                  Edit Doctor
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{doctor.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{doctor.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">License Number</div>
                      <div className="font-medium">{doctor.licenseNumber}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Specialization</div>
                      <div className="font-medium">{specializationLabels[doctor.specialization]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Experience</div>
                      <div className="font-medium">{doctor.experienceYears} years</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Consultation Fee</div>
                      <div className="font-medium">${doctor.consultationFee}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Joined Hospital</span>
                    <span className="text-sm font-medium">{formatDate(doctor.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium">{formatDate(doctor.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Work Schedule
                </CardTitle>
                <CardDescription>
                  Doctor's weekly availability schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schedule ? (
                  <div className="space-y-3">
                    {Object.entries(schedule).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="font-medium capitalize">{day}</div>
                        <div className="text-sm text-muted-foreground">{hours as string}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No schedule information available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Latest appointments and consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Appointment history will be available when integrated with the appointment system</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Patient Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">4.8</div>
                  <p className="text-sm text-muted-foreground">Average rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">342</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">95%</div>
                  <p className="text-sm text-muted-foreground">Treatment success</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Detailed performance metrics will be available when integrated with the analytics system</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}