'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VitalSignsStatistics, vitalSignTypeLabels } from '@/types/vital-signs';

interface VitalSignsStatsProps {
  patientId?: string;
  days?: number;
}

export function VitalSignsStats({ patientId, days = 30 }: VitalSignsStatsProps) {
  const [stats, setStats] = useState<VitalSignsStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const { vitalSignsService } = await import('@/services/vital-signs');
        const statistics = await vitalSignsService.getStatistics({ patientId, days });
        setStats(statistics);
      } catch (error) {
        console.error('Error loading vital signs statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [patientId, days]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No statistics available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Readings</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <span className="text-blue-700 text-xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Normal</p>
                <p className="text-2xl font-bold text-green-900">{stats.normal}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <span className="text-green-700 text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Abnormal</p>
                <p className="text-2xl font-bold text-red-900">{stats.abnormal}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <span className="text-red-700 text-xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Abnormal Rate</p>
                <p className="text-2xl font-bold text-purple-900">{stats.abnormalPercentage}%</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <span className="text-purple-700 text-xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Readings by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byType.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.byType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {vitalSignTypeLabels[item.type]}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No vital signs recorded yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}