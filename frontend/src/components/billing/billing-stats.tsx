'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, Clock, AlertTriangle } from 'lucide-react';
import { BillStatistics, billingService } from '@/services/billing';

export function BillingStats() {
  const [stats, setStats] = useState<BillStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await billingService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load billing statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded"></div>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.billsCount} total invoices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmount(stats.totalPending)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingCount} pending invoices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatAmount(stats.totalOverdue)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.overdueCount} overdue invoices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.billsCount > 0
              ? `${(((stats.billsCount - stats.pendingCount - stats.overdueCount) / stats.billsCount) * 100).toFixed(1)}%`
              : '0%'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Payment collection rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}