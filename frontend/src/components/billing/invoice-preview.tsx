'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Printer, Download } from 'lucide-react';
import { Bill } from '@/services/billing';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

// Add Amiri Arabic font to jsPDF
import 'jspdf-autotable';

interface InvoicePreviewProps {
  bill: Bill;
}

export function InvoicePreview({ bill }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;

    try {
      toast.info('Generating PDF...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Helper function to detect Arabic text
      const hasArabic = (text: string) => {
        return /[\u0600-\u06FF]/.test(text);
      };

      // Helper function to transliterate or show placeholder for Arabic text
      const processText = (text: string) => {
        if (hasArabic(text)) {
          // For Arabic text, show a note that it contains Arabic
          return `[Arabic: ${text.length} chars]`;
        }
        return text;
      };

      // Helper function to add text
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        const processedText = processText(text);
        pdf.text(processedText, x, y, options);
      };

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      addText('MEDICORE HMS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      addText('Hospital Management System', margin, yPosition);
      yPosition += 15;

      // Invoice Info (Right side)
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      addText('INVOICE', pageWidth - margin - 40, margin);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      addText(`Invoice #: ${bill.invoiceNumber}`, pageWidth - margin - 60, margin + 10);
      addText(`Date: ${bill.createdAt ? formatDate(bill.createdAt) : 'N/A'}`, pageWidth - margin - 60, margin + 16);
      if (bill.dueDate) {
        addText(`Due Date: ${formatDate(bill.dueDate)}`, pageWidth - margin - 60, margin + 22);
      }

      // Bill To
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      addText('Bill To:', margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      if (bill.patient) {
        addText(`${bill.patient.firstName} ${bill.patient.lastName}`, margin, yPosition);
        yPosition += 5;
        addText(`Patient ID: ${bill.patient.patientId}`, margin, yPosition);
        yPosition += 5;
        addText(`Phone: ${bill.patient.phone}`, margin, yPosition);
        yPosition += 10;
      }

      // Table Header
      yPosition += 5;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');

      pdf.setFont('helvetica', 'bold');
      addText('Description', margin + 2, yPosition);
      addText('Qty', pageWidth - 100, yPosition);
      addText('Unit Price', pageWidth - 70, yPosition);
      addText('Total', pageWidth - 35, yPosition);
      yPosition += 10;

      // Table Rows
      pdf.setFont('helvetica', 'normal');
      bill.billItems.forEach((item) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        addText(item.description, margin + 2, yPosition);
        addText(item.quantity.toString(), pageWidth - 100, yPosition);
        addText(formatAmount(item.unitPrice), pageWidth - 70, yPosition);
        addText(formatAmount(item.totalPrice), pageWidth - 35, yPosition);
        yPosition += 7;
      });

      // Totals
      yPosition += 10;
      const totalsX = pageWidth - 70;

      addText('Subtotal:', totalsX - 30, yPosition);
      addText(formatAmount(totalAmount), totalsX + 10, yPosition);
      yPosition += 6;

      if (taxAmount > 0) {
        addText('Tax:', totalsX - 30, yPosition);
        addText(formatAmount(taxAmount), totalsX + 10, yPosition);
        yPosition += 6;
      }

      if (discountAmount > 0) {
        addText('Discount:', totalsX - 30, yPosition);
        addText(`-${formatAmount(discountAmount)}`, totalsX + 10, yPosition);
        yPosition += 6;
      }

      // Total Line
      pdf.setLineWidth(0.5);
      pdf.line(totalsX - 35, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      addText('Total:', totalsX - 30, yPosition);
      addText(formatAmount(finalAmount), totalsX + 10, yPosition);
      yPosition += 8;

      if (paidAmount > 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        addText('Amount Paid:', totalsX - 30, yPosition);
        addText(`-${formatAmount(paidAmount)}`, totalsX + 10, yPosition);
        yPosition += 6;

        pdf.line(totalsX - 35, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;

        pdf.setFont('helvetica', 'bold');
        addText('Balance Due:', totalsX - 30, yPosition);
        addText(formatAmount(Math.max(0, balance)), totalsX + 10, yPosition);
      }

      // Footer
      yPosition = pageHeight - 20;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      addText('Thank you for choosing MediCore Hospital Management System!', pageWidth / 2, yPosition, { align: 'center' });

      // Save PDF
      pdf.save(`Invoice-${bill.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
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
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Invoice */}
      <div
        ref={invoiceRef}
        data-invoice
        className="bg-white print:shadow-none shadow-lg"
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
      >
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