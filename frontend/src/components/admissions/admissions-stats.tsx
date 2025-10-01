'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  UserCheck,
  Calendar,
  TrendingUp,
  Building2
} from 'lucide-react';
import { AdmissionStatistics, WardStatistics, wardLabels } from '@/types/admission';

export function AdmissionsStats() {
  const [stats, setStats] = useState<AdmissionStatistics | null>(null);
  const [wardStats, setWardStats] = useState<WardStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const { admissionsService } = await import('@/services/admissions');

        const [admissionStats, wardStatistics] = await Promise.all([
          admissionsService.getStatistics(),
          admissionsService.getWardStatistics(),
        ]);

        setStats(admissionStats);
        setWardStats(wardStatistics);
      } catch (error) {
        console.error('Error loading admission statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Active Admissions
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {stats.activeAdmissions}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Currently admitted patients
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Today's Admissions
            </CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {stats.admissionsToday}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Admitted today
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {stats.admissionsThisMonth}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Admissions this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Discharged
            </CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {stats.dischargedThisMonth}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Discharged this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Admissions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {stats.totalAdmissions}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              All time total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ward Statistics */}
      {wardStats.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Ward Occupancy
            </CardTitle>
            <CardDescription>
              Current patient distribution across hospital wards
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {wardStats.map((ward) => (
                <div
                  key={ward.ward}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {wardLabels[ward.ward]}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ward.count}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-lg px-3 py-1"
                  >
                    {ward.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}