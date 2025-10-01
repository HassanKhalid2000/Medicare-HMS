'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download } from 'lucide-react';
import { Bill } from '@/services/billing';

interface InvoicePreviewProps {
  bill: Bill;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function InvoicePreview({ bill, onPrint, onDownload }: InvoicePreviewProps) {
  const formatAmount = (amount: string | number) => {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const totalAmount = parseFloat(bill.totalAmount);
  const taxAmount = parseFloat(bill.taxAmount || '0');
  const discountAmount = parseFloat(bill.discountAmount || '0');
  const finalAmount = totalAmount + taxAmount - discountAmount;
  const paidAmount = parseFloat(bill.paidAmount || '0');
  const balance = finalAmount - paidAmount;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Actions */}
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <Button variant="outline" onClick={onPrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Invoice */}
      <div className="bg-white print:shadow-none shadow-lg">
        {/* Header */}
        <div className="p-8 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">MEDICORE HMS</h1>
              <p className="text-muted-foreground mt-2">Hospital Management System</p>
              <div className="mt-4 text-sm">
                <p>123 Healthcare Avenue</p>
                <p>Medical City, MC 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: billing@medicore.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">INVOICE</h2>
              <div className="mt-4 text-sm">
                <p><strong>Invoice #:</strong> {bill.invoiceNumber}</p>
                <p><strong>Date:</strong> {bill.createdAt ? formatDate(bill.createdAt) : 'N/A'}</p>
                {bill.dueDate && (
                  <p><strong>Due Date:</strong> {formatDate(bill.dueDate)}</p>
                )}
                <div className="mt-2">
                  <Badge className={getStatusColor(bill.paymentStatus || 'pending')}>
                    {(bill.paymentStatus || 'pending').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="p-8 border-b">
          <h3 className="text-lg font-semibold mb-4">Bill To:</h3>
          {bill.patient ? (
            <div>
              <p className="font-medium text-lg">
                {bill.patient.firstName} {bill.patient.lastName}
              </p>
              <p className="text-muted-foreground">Patient ID: {bill.patient.patientId}</p>
              <p className="text-muted-foreground">Phone: {bill.patient.phone}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Patient information not available</p>
          )}
        </div>

        {/* Items */}
        <div className="p-8">
          <h3 className="text-lg font-semibold mb-4">Services/Items:</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Description</TableHead>
                <TableHead className="text-center w-20">Qty</TableHead>
                <TableHead className="text-right w-32">Unit Price</TableHead>
                <TableHead className="text-right w-32">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.billItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatAmount(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatAmount(item.totalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="p-8 border-t">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatAmount(totalAmount)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatAmount(taxAmount)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatAmount(discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatAmount(finalAmount)}</span>
                </div>
                {paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Amount Paid:</span>
                      <span>-{formatAmount(paidAmount)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Balance Due:</span>
                      <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatAmount(Math.max(0, balance))}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {bill.paymentMethod && (
          <div className="p-8 border-t bg-muted/30">
            <h3 className="text-lg font-semibold mb-4">Payment Information:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Payment Method:</strong> {bill.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Payment Status:</strong> {(bill.paymentStatus || 'pending').toUpperCase()}</p>
              </div>
              <div>
                <p><strong>Amount Paid:</strong> {formatAmount(paidAmount)}</p>
                <p><strong>Balance:</strong> {formatAmount(Math.max(0, balance))}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {bill.notes && (
          <div className="p-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Notes:</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{bill.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-8 border-t bg-muted/20 text-center text-sm text-muted-foreground">
          <p>Thank you for choosing MediCore Hospital Management System!</p>
          <p className="mt-2">
            For questions about this invoice, please contact our billing department at billing@medicore.com
          </p>
        </div>
      </div>
    </div>
  );
}