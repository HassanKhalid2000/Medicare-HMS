'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Appointment,
  AppointmentQuery,
  AppointmentStatus,
  AppointmentType,
  appointmentTypeLabels,
  appointmentStatusLabels,
  appointmentStatusColors
} from '@/types/appointment';

interface AppointmentListProps {
  onCreateAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onViewAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointment: Appointment) => void;
  onSwitchToCalendar: () => void;
  refreshKey?: number;
}

export function AppointmentList({
  onCreateAppointment,
  onEditAppointment,
  onViewAppointment,
  onDeleteAppointment,
  onSwitchToCalendar,
  refreshKey
}: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<AppointmentQuery>({
    page: 1,
    limit: 10,
    sortBy: 'appointmentDate',
    sortOrder: 'asc'
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  // Load appointments from API
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const { appointmentsService } = await import('@/services/appointments');
        const response = await appointmentsService.getAppointments(query);
        setAppointments(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error('Failed to load appointments:', error);
        setAppointments([]);
        setMeta({ total: 0, page: 1, limit: 10, totalPages: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [query, refreshKey]);

  // Load today's appointments
  const loadTodayAppointments = async () => {
    try {
      setLoadingToday(true);
      const { appointmentsService } = await import('@/services/appointments');
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const response = await appointmentsService.getAppointments({
        dateFrom: todayStr,
        dateTo: todayStr,
        limit: 50,
        sortBy: 'appointmentTime',
        sortOrder: 'asc'
      });
      setTodayAppointments(response.data);
    } catch (error) {
      console.error('Failed to load today appointments:', error);
      setTodayAppointments([]);
    } finally {
      setLoadingToday(false);
    }
  };

  // Load upcoming appointments (next 7 days)
  const loadUpcomingAppointments = async () => {
    try {
      setLoadingUpcoming(true);
      const { appointmentsService } = await import('@/services/appointments');
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const todayStr = today.toISOString().split('T')[0];
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const response = await appointmentsService.getAppointments({
        dateFrom: todayStr,
        dateTo: nextWeekStr,
        limit: 100,
        sortBy: 'appointmentDate',
        sortOrder: 'asc'
      });
      setUpcomingAppointments(response.data);
    } catch (error) {
      console.error('Failed to load upcoming appointments:', error);
      setUpcomingAppointments([]);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (field: keyof AppointmentQuery, value: string) => {
    setQuery(prev => ({
      ...prev,
      [field]: value === 'all' ? undefined : value,
      page: 1
    }));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));
  };

  // Render appointments list
  const renderAppointmentsList = (appointmentsList: Appointment[], isLoading: boolean, emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (appointmentsList.length === 0) {
      return (
        <div className="text-center py-8">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {appointmentsList.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(appointment.appointmentTime)} ({appointment.duration} min)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {appointmentTypeLabels[appointment.type]}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={appointmentStatusColors[appointment.status]}
                  >
                    {appointmentStatusLabels[appointment.status]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Patient</div>
                  <div className="font-medium">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: {appointment.patient?.patientId}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Doctor</div>
                  <div className="font-medium">{appointment.doctor?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.doctor?.specialization}
                  </div>
                </div>
              </div>

              {appointment.symptoms && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Symptoms</div>
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {appointment.symptoms}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewAppointment(appointment)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditAppointment(appointment)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteAppointment(appointment)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Loading appointments...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
          <p className="text-muted-foreground">
            Schedule and manage patient appointments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSwitchToCalendar} className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar View
          </Button>
          <Button onClick={onCreateAppointment} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full" onValueChange={(value) => {
        if (value === 'today') {
          loadTodayAppointments();
        } else if (value === 'upcoming') {
          loadUpcomingAppointments();
        }
      }}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="today">Today's Appointments</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by patient name, doctor, or appointment ID..."
                      value={query.search || ''}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={query.status || 'all'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {Object.entries(appointmentStatusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={query.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(appointmentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Appointments ({meta.total} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Symptoms</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{formatDate(appointment.appointmentDate)}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(appointment.appointmentTime)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.patient?.patientId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{appointment.doctor?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.doctor?.specialization}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {appointmentTypeLabels[appointment.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {appointment.duration} min
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={appointmentStatusColors[appointment.status]}
                            >
                              {appointmentStatusLabels[appointment.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-32 truncate">
                              {appointment.symptoms || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => onViewAppointment(appointment)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onEditAppointment(appointment)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Appointment
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDeleteAppointment(appointment)}
                                  className="flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Cancel Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(prev => ({ ...prev, page: prev.page! - 1 }))}
                      disabled={meta.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuery(prev => ({ ...prev, page: prev.page! + 1 }))}
                      disabled={meta.page >= meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Today's Appointments
              </CardTitle>
              <CardDescription>
                {formatDate(new Date())} • {todayAppointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAppointmentsList(todayAppointments, loadingToday, "No appointments scheduled for today")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>
                Next 7 days • {upcomingAppointments.length} appointments scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAppointmentsList(upcomingAppointments, loadingUpcoming, "No upcoming appointments in the next 7 days")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}