'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog, Calendar, CreditCard, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { statistics, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard statistics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Error loading dashboard data</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load dashboard statistics: {error}</span>
            </div>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Patients',
      value: statistics?.patients.total.toLocaleString() || '0',
      description: `${statistics?.patients.newThisMonth || 0} new this month`,
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Active Doctors',
      value: statistics?.doctors.active.toString() || '0',
      description: `${statistics?.doctors.total || 0} total doctors`,
      icon: UserCog,
      trend: 'up'
    },
    {
      title: 'Total Appointments',
      value: statistics?.appointments.total.toLocaleString() || '0',
      description: `${statistics?.appointments.scheduled || 0} scheduled`,
      icon: Calendar,
      trend: 'neutral'
    },
    {
      title: 'Total Revenue',
      value: `$${statistics?.billing.totalRevenue || '0'}`,
      description: `${statistics?.billing.pendingCount || 0} pending bills`,
      icon: CreditCard,
      trend: 'up'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      description: 'New appointment scheduled with Dr. Smith',
      time: '5 minutes ago',
      patient: 'John Doe'
    },
    {
      id: 2,
      type: 'admission',
      description: 'Patient admitted to ICU',
      time: '15 minutes ago',
      patient: 'Jane Smith'
    },
    {
      id: 3,
      type: 'billing',
      description: 'Payment received for invoice #INV-2024-001',
      time: '30 minutes ago',
      amount: '$450'
    },
    {
      id: 4,
      type: 'doctor',
      description: 'Dr. Johnson updated patient diagnosis',
      time: '1 hour ago',
      patient: 'Mike Wilson'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your hospital&apos;s performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common hospital tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded">
              <Users className="h-4 w-4" />
              Register New Patient
            </button>
            <button className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded">
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </button>
            <button className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded">
              <UserCog className="h-4 w-4" />
              Add New Doctor
            </button>
            <button className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded">
              <CreditCard className="h-4 w-4" />
              Create Invoice
            </button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your hospital</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.time}</span>
                      {activity.patient && (
                        <>
                          <span>•</span>
                          <span>Patient: {activity.patient}</span>
                        </>
                      )}
                      {activity.amount && (
                        <>
                          <span>•</span>
                          <span>{activity.amount}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription>Key metrics for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Patient Satisfaction</span>
                <span className="text-sm font-medium">4.8/5</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Appointment Efficiency</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Revenue Target</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Upcoming important events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded border">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Emergency Surgery</p>
                  <p className="text-xs text-muted-foreground">Dr. Smith • 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded border">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Board Meeting</p>
                  <p className="text-xs text-muted-foreground">Conference Room • 4:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded border">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Staff Training</p>
                  <p className="text-xs text-muted-foreground">Training Room • 6:00 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}