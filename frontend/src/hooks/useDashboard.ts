import { useState, useEffect } from 'react';
import { dashboardService, DashboardStatistics } from '@/services/dashboard';

interface UseDashboardReturn {
  statistics: DashboardStatistics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAllStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard statistics');
      console.error('Dashboard statistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
}