'use client';

import { useState } from 'react';
import { CheckCircle2, Edit2, Trash2, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { medicalAlertsApi, type MedicalAlert, AlertSeverity } from '@/lib/api/medical-alerts';
import { toast } from 'sonner';

interface MedicalAlertDetailsDialogProps {
  alert: MedicalAlert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function MedicalAlertDetailsDialog({
  alert,
  open,
  onOpenChange,
  onUpdate,
}: MedicalAlertDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      await medicalAlertsApi.acknowledge(alert.id);
      toast.success('Alert acknowledged');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await medicalAlertsApi.deactivate(alert.id);
      toast.success('Alert deactivated');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await medicalAlertsApi.delete(alert.id);
      toast.success('Alert deleted');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete alert');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
              {alert.isAcknowledged && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Acknowledged
                </Badge>
              )}
              {!alert.isActive && <Badge variant="secondary">Inactive</Badge>}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Alert Type</h3>
                <p className="text-base">{alert.alertType.replace(/_/g, ' ')}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                <p className="text-lg font-semibold">{alert.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Message</h3>
                <p className="text-base">{alert.message}</p>
              </div>

              {alert.patient && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                  <p className="text-base font-medium">
                    {alert.patient.firstName} {alert.patient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">MRN: {alert.patient.mrn}</p>
                </div>
              )}

              {alert.expiresAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Expires At</h3>
                  <p className="text-base">
                    {new Date(alert.expiresAt).toLocaleString()}
                  </p>
                </div>
              )}

              {alert.isAcknowledged && alert.acknowledgedAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Acknowledged
                  </h3>
                  <p className="text-base">
                    {new Date(alert.acknowledgedAt).toLocaleString()}
                  </p>
                  {alert.acknowledgedByUser && (
                    <p className="text-sm text-muted-foreground">
                      By: {alert.acknowledgedByUser.fullName}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p>Created: {new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p>Updated: {new Date(alert.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <div className="flex gap-2">
                {!alert.isAcknowledged && (
                  <Button onClick={handleAcknowledge} disabled={loading}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Acknowledge
                  </Button>
                )}
                {alert.isActive && (
                  <Button
                    variant="outline"
                    onClick={handleDeactivate}
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Deactivate
                  </Button>
                )}
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
