'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle, Edit2, Trash2, XCircle } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { allergiesApi, type Allergy } from '@/lib/api/allergies';
import { toast } from 'sonner';

const allergySchema = z.object({
  allergen: z.string().min(1).max(255),
  category: z.string().min(1),
  reaction: z.string().min(1),
  severity: z.string().min(1),
  notes: z.string().optional(),
  diagnosedAt: z.string().optional(),
});

interface AllergyDetailsDialogProps {
  allergy: Allergy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function AllergyDetailsDialog({
  allergy,
  open,
  onOpenChange,
  onUpdate,
}: AllergyDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<z.infer<typeof allergySchema>>({
    resolver: zodResolver(allergySchema),
    values: {
      allergen: allergy.allergen,
      category: allergy.category,
      reaction: allergy.reaction,
      severity: allergy.severity,
      notes: allergy.notes || '',
      diagnosedAt: allergy.diagnosedAt
        ? new Date(allergy.diagnosedAt).toISOString().split('T')[0]
        : '',
    },
  });

  const onSubmit = async (data: z.infer<typeof allergySchema>) => {
    try {
      setLoading(true);
      await allergiesApi.updateAllergy(allergy.id, data);
      toast.success('Allergy record updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update allergy record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      setLoading(true);
      await allergiesApi.deactivateAllergy(allergy.id);
      toast.success('Allergy record deactivated');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to deactivate allergy record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await allergiesApi.deleteAllergy(allergy.id);
      toast.success('Allergy record deleted');
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete allergy record');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
      case 'life-threatening':
        return 'destructive';
      case 'moderate':
        return 'default';
      case 'mild':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Allergy Details
            </DialogTitle>
          </DialogHeader>

          {!isEditing ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800">{allergy.category}</Badge>
                <Badge variant={getSeverityColor(allergy.severity)}>
                  {allergy.severity}
                </Badge>
                {!allergy.isActive && <Badge variant="outline">Inactive</Badge>}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                  <p className="text-lg font-semibold">
                    {allergy.patient.firstName} {allergy.patient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">MRN: {allergy.patient.mrn}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Allergen</h3>
                    <p className="text-base font-medium">{allergy.allergen}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Diagnosed Date
                    </h3>
                    <p className="text-base">
                      {allergy.diagnosedAt
                        ? new Date(allergy.diagnosedAt).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Reaction</h3>
                  <p className="text-base">{allergy.reaction}</p>
                </div>

                {allergy.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="text-base">{allergy.notes}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p>Created: {new Date(allergy.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p>Updated: {new Date(allergy.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {allergy.isActive && (
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
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="allergen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergen *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Medication">Medication</SelectItem>
                            <SelectItem value="Food">Food</SelectItem>
                            <SelectItem value="Environmental">Environmental</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Severity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mild">Mild</SelectItem>
                            <SelectItem value="Moderate">Moderate</SelectItem>
                            <SelectItem value="Severe">Severe</SelectItem>
                            <SelectItem value="Life-threatening">
                              Life-threatening
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosed Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reaction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reaction *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allergy Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this allergy record? This action cannot be
              undone.
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
