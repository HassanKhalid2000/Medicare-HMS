'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog, Calendar, CreditCard, TrendingUp, Activity, AlertCircle, BedDouble, DollarSign } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function DashboardPage() {
  const { statistics, loading, error, refetch } = useDashboard();
  const router = useRouter();

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
      trend: 'up',
      color: 'text-blue-600'
    },
    {
      title: 'Active Doctors',
      value: statistics?.doctors.active.toString() || '0',
      description: `${statistics?.doctors.total || 0} total doctors`,
      icon: UserCog,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Appointments',
      value: statistics?.appointments.total.toLocaleString() || '0',
      description: `${statistics?.appointments.scheduled || 0} scheduled`,
      icon: Calendar,
      trend: 'neutral',
      color: 'text-purple-600'
    },
    {
      title: 'Total Revenue',
      value: `$${statistics?.billing.totalRevenue || '0'}`,
      description: `${statistics?.billing.pendingCount || 0} pending bills`,
      icon: CreditCard,
      trend: 'up',
      color: 'text-emerald-600'
    },
    {
      title: 'Active Admissions',
      value: statistics?.admissions?.active.toString() || '0',
      description: `${statistics?.admissions?.total || 0} total admissions`,
      icon: BedDouble,
      trend: 'up',
      color: 'text-orange-600'
    },
    {
      title: 'Monthly Revenue',
      value: `$${statistics?.billing.totalRevenue || '0'}`,
      description: `${statistics?.billing.overdueCount || 0} overdue bills`,
      icon: DollarSign,
      trend: 'up',
      color: 'text-teal-600'
    }
  ];

  // Prepare chart data
  const appointmentStatusData = [
    { name: 'Scheduled', value: statistics?.appointments.scheduled || 0 },
    { name: 'Confirmed', value: statistics?.appointments.confirmed || 0 },
    { name: 'Completed', value: statistics?.appointments.completed || 0 },
    { name: 'Cancelled', value: statistics?.appointments.cancelled || 0 },
  ].filter(item => item.value > 0);

  const genderData = Object.entries(statistics?.patients.byGender || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const specializationData = Object.entries(statistics?.doctors.bySpecialization || {}).map(([name, value]) => ({
    name,
    value
  }));

  const revenueData = statistics?.revenue?.last6Months?.map(item => ({
    month: item.month,
    revenue: parseFloat(item.revenue)
  })) || [];

  const paymentMethodData = statistics?.revenue?.byPaymentMethod?.map((item, index) => ({
    name: item.method ? item.method.replace('_', ' ').toUpperCase() : 'UNKNOWN',
    value: parseFloat(item.revenue),
    fill: COLORS[index % COLORS.length]
  })).filter(item => item.value > 0) || [];

  const wardData = statistics?.admissions?.byWard?.map((item, index) => ({
    name: `Ward ${item.ward}`,
    patients: item.count,
    fill: COLORS[index % COLORS.length]
  })) || [];

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trend (Last 6 Months)
            </CardTitle>
            <CardDescription>Monthly revenue from paid bills</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Distribution of appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
            <CardDescription>Payment method distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" name="Revenue">
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common hospital tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => router.push('/patients')}
              className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded transition-colors"
            >
              <Users className="h-4 w-4" />
              Register New Patient
            </button>
            <button
              onClick={() => router.push('/appointments')}
              className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </button>
            <button
              onClick={() => router.push('/doctors')}
              className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded transition-colors"
            >
              <UserCog className="h-4 w-4" />
              Add New Doctor
            </button>
            <button
              onClick={() => router.push('/billing')}
              className="w-full flex items-center justify-start gap-2 p-2 text-sm hover:bg-muted rounded transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Create Invoice
            </button>
          </CardContent>
        </Card>

        {/* Patient Gender Distribution */}
        {genderData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Patients by Gender</CardTitle>
              <CardDescription>Gender distribution of patients</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ward Occupancy */}
        {wardData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ward Occupancy</CardTitle>
              <CardDescription>Current patients by ward</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="patients" name="Patients">
                    {wardData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Doctor Specializations */}
      {specializationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Doctors by Specialization</CardTitle>
            <CardDescription>Distribution of doctors across specializations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={specializationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" name="Doctors" fill="#8884d8">
                  {specializationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}