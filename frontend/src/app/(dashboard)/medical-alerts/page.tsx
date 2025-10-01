'use client';

import { useState, useEffect } from 'react';
import { Plus, Bell, BellOff, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  medicalAlertsApi,
  type MedicalAlert,
  type MedicalAlertQueryParams,
  type AlertStatistics,
  AlertSeverity,
} from '@/lib/api/medical-alerts';
import { CreateMedicalAlertDialog } from '@/components/medical-alerts/CreateMedicalAlertDialog';
import { MedicalAlertDetailsDialog } from '@/components/medical-alerts/MedicalAlertDetailsDialog';
import { toast } from 'sonner';

export default function MedicalAlertsPage() {
  const [alerts, setAlerts] = useState<MedicalAlert[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MedicalAlertQueryParams>({
    page: 1,
    limit: 10,
    isActive: true,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<MedicalAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAlerts();
    loadStatistics();
  }, [filters]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await medicalAlertsApi.getAll(filters);
      setAlerts(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load medical alerts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await medicalAlertsApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await medicalAlertsApi.acknowledge(id);
      toast.success('Alert acknowledged');
      loadAlerts();
      loadStatistics();
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case AlertSeverity.HIGH:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case AlertSeverity.MEDIUM:
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'destructive';
      case AlertSeverity.HIGH:
        return 'default';
      case AlertSeverity.MEDIUM:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medical Alerts</h1>
          <p className="text-muted-foreground">Manage patient alerts and reminders</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.bySeverity.CRITICAL}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.acknowledged}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select
              value={filters.severity || 'all'}
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value={AlertSeverity.LOW}>Low</SelectItem>
                <SelectItem value={AlertSeverity.MEDIUM}>Medium</SelectItem>
                <SelectItem value={AlertSeverity.HIGH}>High</SelectItem>
                <SelectItem value={AlertSeverity.CRITICAL}>Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.isAcknowledged?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange('isAcknowledged', value === 'all' ? 'all' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="false">Unacknowledged</SelectItem>
                <SelectItem value="true">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alerts found
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {alert.isAcknowledged && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Acknowledged
                              </Badge>
                            )}
                            {!alert.isActive && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {alert.patient && (
                              <span>
                                Patient: {alert.patient.firstName} {alert.patient.lastName}
                              </span>
                            )}
                            <span>Type: {alert.alertType.replace(/_/g, ' ')}</span>
                            <span>
                              Created: {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!alert.isAcknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcknowledge(alert.id);
                          }}
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={filters.page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateMedicalAlertDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          loadAlerts();
          loadStatistics();
          setShowCreateDialog(false);
        }}
      />

      {selectedAlert && (
        <MedicalAlertDetailsDialog
          alert={selectedAlert}
          open={!!selectedAlert}
          onOpenChange={(open) => !open && setSelectedAlert(null)}
          onUpdate={() => {
            loadAlerts();
            loadStatistics();
          }}
        />
      )}
    </div>
  );
}
