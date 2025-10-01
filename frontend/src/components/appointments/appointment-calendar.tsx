'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, List, Calendar as CalendarIcon, Clock, User, UserCog, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import {
  Appointment,
  CalendarEvent,
  AppointmentStatus,
  AppointmentType,
  appointmentStatusColors,
  appointmentTypeLabels
} from '@/types/appointment';

interface AppointmentCalendarProps {
  onCreateAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onViewAppointment: (appointment: Appointment) => void;
  onSwitchToList: () => void;
}

export function AppointmentCalendar({
  onCreateAppointment,
  onEditAppointment,
  onViewAppointment,
  onSwitchToList
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Load appointments from API
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);

        // Load appointments from API using date range for current month
        const startDate = startOfMonth(currentDate);
        const endDate = endOfMonth(currentDate);

        const { appointmentsService } = await import('@/services/appointments');
        const response = await appointmentsService.getAppointments({
          dateFrom: startDate.toISOString().split('T')[0],
          dateTo: endDate.toISOString().split('T')[0],
          limit: 100 // Get more appointments for calendar view
        });

        const fetchedAppointments = response.data || [];

        // Convert appointments to calendar events
        const events: CalendarEvent[] = fetchedAppointments.map(appointment => {
          const start = new Date(appointment.appointmentTime);
          const end = new Date(start.getTime() + appointment.duration * 60000);

          return {
            id: appointment.id,
            title: `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
            start,
            end,
            type: appointment.type,
            status: appointment.status,
            patient: `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
            doctor: appointment.doctor?.name || '',
          };
        });

        setAppointments(fetchedAppointments);
        setCalendarEvents(events);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
        setCalendarEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter(event => isSameDay(event.start, day));
  };

  const getSelectedDateAppointments = () => {
    if (!selectedDate) return [];
    return appointments.filter(appointment =>
      isSameDay(new Date(appointment.appointmentDate), selectedDate)
    );
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Loading calendar...</CardDescription>
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
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Appointment Calendar</h2>
          <p className="text-muted-foreground">
            Visual overview of scheduled appointments with modern interface.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSwitchToList} className="flex items-center gap-2 hover:scale-105 transition-all duration-200">
            <List className="h-4 w-4" />
            List View
          </Button>
          <Button onClick={onCreateAppointment} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-lg">
            <Plus className="h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {format(currentDate, 'MMMM yyyy')}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                    className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Select value={view} onValueChange={(value) => setView(value as 'month' | 'week' | 'day')}>
                  <SelectTrigger className="w-32 border-blue-200 hover:border-blue-300 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {view === 'month' && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gradient-to-b from-gray-50 to-gray-100 border-b">
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {calendarDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'min-h-28 p-2 border border-border/50 cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]',
                          !isCurrentMonth && 'text-muted-foreground bg-gray-50/50',
                          isToday && 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 shadow-md ring-2 ring-blue-200',
                          isSelected && 'bg-gradient-to-br from-blue-200 to-purple-200 border-blue-500 shadow-lg ring-2 ring-blue-300',
                          hoveredDate && isSameDay(day, hoveredDate) && 'shadow-lg'
                        )}
                        onClick={() => setSelectedDate(day)}
                        onMouseEnter={() => setHoveredDate(day)}
                        onMouseLeave={() => setHoveredDate(null)}
                      >
                        <div className={cn(
                          'text-sm mb-2 relative',
                          isToday && 'font-bold text-blue-700',
                          !isCurrentMonth && 'text-gray-400'
                        )}>
                          <span className={cn(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full',
                            isToday && 'bg-blue-600 text-white shadow-sm'
                          )}>
                            {format(day, 'd')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {dayEvents.length > 0 && (
                            <>
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={cn(
                                    'text-xs p-2 rounded-md text-white cursor-pointer truncate hover:scale-105 transition-all duration-200 shadow-sm group relative',
                                    event.status === AppointmentStatus.SCHEDULED && 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                                    event.status === AppointmentStatus.CONFIRMED && 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                                    event.status === AppointmentStatus.COMPLETED && 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
                                    event.status === AppointmentStatus.CANCELLED && 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                                    event.status === AppointmentStatus.NO_SHOW && 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const appointment = appointments.find(a => a.id === event.id);
                                    if (appointment) onViewAppointment(appointment);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{formatTime(event.start)}</span>
                                    <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="truncate">{event.title}</div>
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div
                                  className="text-xs text-muted-foreground bg-gray-100 rounded px-2 py-1 text-center hover:bg-gray-200 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(day);
                                  }}
                                >
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                              <div className="text-center mt-1">
                                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-blue-50 rounded-full px-2 py-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>{dayEvents.length} appointment{dayEvents.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'week' && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Week view will be implemented in future updates</p>
                </div>
              )}

              {view === 'day' && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Day view will be implemented in future updates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a Date'}
              </CardTitle>
              <CardDescription>
                {selectedDate ? `${getSelectedDateAppointments().length} appointments` : 'Click on a date to view appointments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {getSelectedDateAppointments().length === 0 ? (
                    <div className="text-center py-6">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No appointments scheduled</p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={onCreateAppointment}
                      >
                        Schedule One
                      </Button>
                    </div>
                  ) : (
                    getSelectedDateAppointments().map(appointment => (
                      <div
                        key={appointment.id}
                        className="p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md group"
                        onClick={() => onViewAppointment(appointment)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded-full">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-800">
                              {formatTime(new Date(appointment.appointmentTime))}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Badge
                              variant="secondary"
                              className={cn(
                                appointmentStatusColors[appointment.status],
                                'shadow-sm font-medium'
                              )}
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1 bg-green-100 rounded-full">
                              <User className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="p-1 bg-purple-100 rounded-full">
                              <UserCog className="h-3 w-3 text-purple-600" />
                            </div>
                            <span className="font-medium">{appointment.doctor?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-md px-2 py-1">
                            <span className="font-medium">{appointmentTypeLabels[appointment.type]}</span>
                            <span>•</span>
                            <span>{appointment.duration} min</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click on a calendar date to view appointments for that day
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Appointments</span>
                  <span className="font-bold text-lg text-gray-800">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Confirmed</span>
                  <span className="font-bold text-lg text-green-600">
                    {appointments.filter(a => a.status === AppointmentStatus.CONFIRMED).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Scheduled</span>
                  <span className="font-bold text-lg text-blue-600">
                    {appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Completed</span>
                  <span className="font-bold text-lg text-gray-600">
                    {appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}