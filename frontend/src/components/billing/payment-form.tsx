'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bill, ProcessPayment, billingService } from '@/services/billing';

interface PaymentFormProps {
  bill: Bill;
  onSuccess?: (bill: Bill) => void;
  onCancel?: () => void;
}

interface FormData {
  amount: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'insurance';
  notes: string;
}

export function PaymentForm({ bill, onSuccess, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const outstandingBalance = parseFloat(bill.balance || '0');
  const maxPaymentAmount = outstandingBalance;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      amount: maxPaymentAmount.toString(),
      paymentMethod: 'cash',
      notes: '',
    },
  });

  const watchedAmount = watch('amount');
  const paymentAmount = parseFloat(watchedAmount) || 0;

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      if (paymentAmount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return;
      }

      if (paymentAmount > maxPaymentAmount) {
        toast.error('Payment amount cannot exceed outstanding balance');
        return;
      }

      const paymentData: ProcessPayment = {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined,
      };

      const result = await billingService.processPayment(bill.id!, paymentData);
      toast.success('Payment processed successfully');
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast.error((error as Error).message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: string | number) => {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Bill Information - Compact */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Invoice:</span> <span className="font-medium">{bill.invoiceNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Patient:</span> <span className="font-medium">
              {bill.patient ? `${bill.patient.firstName} ${bill.patient.lastName}` : 'Unknown'}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-medium">{formatAmount(bill.finalAmount || bill.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span className="font-medium">{formatAmount(bill.paidAmount || '0')}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Outstanding Balance:</span>
            <span className="text-destructive">{formatAmount(outstandingBalance)}</span>
          </div>
        </div>

        <Separator />
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="amount" className="text-sm">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              max={maxPaymentAmount}
              {...register('amount', {
                required: 'Payment amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                max: { value: maxPaymentAmount, message: 'Amount cannot exceed outstanding balance' },
              })}
              placeholder="0.00"
              className="h-9"
            />
            {errors.amount && (
              <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentMethod" className="text-sm">Payment Method *</Label>
            <Select
              value={watch('paymentMethod')}
              onValueChange={(value) => setValue('paymentMethod', value as 'cash' | 'card' | 'bank_transfer' | 'insurance')}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
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

        <div>
          <Label htmlFor="notes" className="text-sm">Payment Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes (optional)"
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Payment Summary - Compact */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span>Payment Amount:</span>
            <span className="font-medium">{formatAmount(paymentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining Balance:</span>
            <span className="font-medium">
              {formatAmount(Math.max(0, outstandingBalance - paymentAmount))}
            </span>
          </div>
          <Separator className="my-1.5" />
          <div className="flex justify-between items-center font-bold">
            <span>New Status:</span>
            <Badge className={
              paymentAmount >= outstandingBalance
                ? 'bg-green-100 text-green-800'
                : paymentAmount > 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }>
              {paymentAmount >= outstandingBalance
                ? 'Paid'
                : paymentAmount > 0
                ? 'Partial'
                : 'Pending'}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="h-9">
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || paymentAmount <= 0 || paymentAmount > maxPaymentAmount}
            className="h-9"
          >
            {isLoading ? 'Processing...' : `Process Payment ${formatAmount(paymentAmount)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}