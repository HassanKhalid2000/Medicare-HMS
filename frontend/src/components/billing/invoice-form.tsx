'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Bill, BillItem, billingService } from '@/services/billing';
import { Patient, patientsService } from '@/services/patients';

interface InvoiceFormProps {
  bill?: Bill;
  onSuccess?: (bill: Bill) => void;
  onCancel?: () => void;
}

interface FormData {
  patientId: string;
  billItems: BillItem[];
  taxAmount: string;
  discountAmount: string;
  paidAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  dueDate?: Date;
  notes: string;
}

export function InvoiceForm({ bill, onSuccess, onCancel }: InvoiceFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const isEditing = !!bill;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      patientId: bill?.patientId || '',
      billItems: bill?.billItems || [{ description: '', quantity: 1, unitPrice: '0', totalPrice: '0' }],
      taxAmount: bill?.taxAmount || '0',
      discountAmount: bill?.discountAmount || '0',
      paidAmount: bill?.paidAmount || '0',
      paymentMethod: bill?.paymentMethod || '',
      paymentStatus: bill?.paymentStatus || 'pending',
      dueDate: bill?.dueDate ? new Date(bill.dueDate) : undefined,
      notes: bill?.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'billItems',
  });

  const watchedItems = watch('billItems');
  const taxAmount = watch('taxAmount');
  const discountAmount = watch('discountAmount');

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    return sum + (parseFloat(item.totalPrice) || 0);
  }, 0);

  const finalAmount = subtotal + (parseFloat(taxAmount) || 0) - (parseFloat(discountAmount) || 0);

  // Load patients
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientsService.getPatients({ limit: 100 });
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  // Update item total when quantity or unit price changes
  const updateItemTotal = (index: number, field: 'quantity' | 'unitPrice', value: string) => {
    const quantity = field === 'quantity' ? parseFloat(value) || 0 : watchedItems[index].quantity;
    const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(watchedItems[index].unitPrice) || 0;
    const totalPrice = (quantity * unitPrice).toFixed(2);

    setValue(`billItems.${index}.totalPrice`, totalPrice);
  };

  const addBillItem = () => {
    append({ description: '', quantity: 1, unitPrice: '0', totalPrice: '0' });
  };

  const removeBillItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Calculate total amount (before tax and discount)
      const totalAmount = subtotal.toFixed(2);

      const billData: Omit<Bill, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'> = {
        patientId: data.patientId,
        totalAmount,
        taxAmount: data.taxAmount || '0',
        discountAmount: data.discountAmount || '0',
        paidAmount: data.paidAmount || '0',
        paymentMethod: data.paymentMethod as 'cash' | 'card' | 'bank_transfer' | 'insurance',
        paymentStatus: data.paymentStatus as 'pending' | 'paid' | 'partial' | 'overdue',
        dueDate: data.dueDate,
        notes: data.notes,
        billItems: data.billItems,
      };

      let result: Bill;
      if (isEditing && bill?.id) {
        result = await billingService.updateBill(bill.id, billData);
        toast.success('Invoice updated successfully');
      } else {
        result = await billingService.createBill(billData);
        toast.success('Invoice created successfully');
      }

      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save invoice:', error);
      toast.error((error as Error).message || 'Failed to save invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === watch('patientId'));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
        </h2>
        <p className="text-muted-foreground">
          {isEditing ? 'Update invoice details' : 'Create a new invoice for patient billing'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientId">Patient *</Label>
              <Select
                value={watch('patientId')}
                onValueChange={(value) => setValue('patientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? 'Loading patients...' : 'Select a patient'} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && (
                <p className="text-sm text-destructive mt-1">Patient is required</p>
              )}
            </div>

            {selectedPatient && (
              <div className="p-4 bg-muted rounded-lg">
                <p><strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                <p><strong>Patient ID:</strong> {selectedPatient.patientId}</p>
                <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                {selectedPatient.email && <p><strong>Email:</strong> {selectedPatient.email}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBillItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-5">
                    <Label htmlFor={`billItems.${index}.description`}>Description</Label>
                    <Input
                      {...register(`billItems.${index}.description`, { required: true })}
                      placeholder="Service/Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`billItems.${index}.quantity`}>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      {...register(`billItems.${index}.quantity`, {
                        required: true,
                        min: 1,
                        onChange: (e) => updateItemTotal(index, 'quantity', e.target.value),
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`billItems.${index}.unitPrice`}>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      {...register(`billItems.${index}.unitPrice`, {
                        required: true,
                        min: 0,
                        onChange: (e) => updateItemTotal(index, 'unitPrice', e.target.value),
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`billItems.${index}.totalPrice`}>Total</Label>
                    <Input
                      type="number"
                      readOnly
                      {...register(`billItems.${index}.totalPrice`)}
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeBillItem(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing Details */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxAmount">Tax Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('taxAmount')}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="discountAmount">Discount Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('discountAmount')}
                  placeholder="0.00"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${(parseFloat(taxAmount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${(parseFloat(discountAmount) || 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paidAmount">Amount Paid</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('paidAmount')}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={watch('paymentMethod')}
                  onValueChange={(value) => setValue('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={watch('paymentStatus')}
                  onValueChange={(value) => setValue('paymentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watch('dueDate') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('dueDate') ? format(watch('dueDate')!, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('dueDate')}
                      onSelect={(date) => setValue('dueDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                {...register('notes')}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}