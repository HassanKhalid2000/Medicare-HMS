'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Bill, BillQuery, billingService } from '@/services/billing';
import { InvoiceForm } from './invoice-form';
import { PaymentForm } from './payment-form';
import { InvoicePreview } from './invoice-preview';

interface BillListProps {
  onCreateNew?: () => void;
}

export function BillList({ onCreateNew }: BillListProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const loadBills = useCallback(async () => {
    try {
      setIsLoading(true);
      const query: BillQuery = {
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        paymentStatus: statusFilter || undefined,
      };

      const response = await billingService.getBills(query);
      setBills(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowEditDialog(true);
  };

  const handleProcessPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setShowPaymentDialog(true);
  };

  const handlePreviewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowPreviewDialog(true);
  };

  const handleDeleteBill = async (bill: Bill) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      await billingService.deleteBill(bill.id!);
      toast.success('Bill deleted successfully');
      loadBills();
    } catch (error) {
      console.error('Failed to delete bill:', error);
      toast.error((error as Error).message || 'Failed to delete bill');
    }
  };

  const handleBillUpdated = (updatedBill: Bill) => {
    setBills(bills.map(bill => bill.id === updatedBill.id ? updatedBill : bill));
    setShowEditDialog(false);
    setShowPaymentDialog(false);
    setSelectedBill(null);
    toast.success('Bill updated successfully');
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

  const formatAmount = (amount: string | number) => {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoices & Bills</h2>
          <p className="text-muted-foreground">Manage patient invoices and billing</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by invoice number, patient name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Payment Status</Label>
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={9} className="h-12">
                    <div className="animate-pulse bg-muted h-4 rounded"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <p className="text-muted-foreground">No bills found</p>
                  <Button variant="outline" onClick={onCreateNew} className="mt-2">
                    Create your first invoice
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.invoiceNumber}</TableCell>
                  <TableCell>
                    {bill.patient ? (
                      <div>
                        <p>{bill.patient.firstName} {bill.patient.lastName}</p>
                        <p className="text-sm text-muted-foreground">{bill.patient.patientId}</p>
                      </div>
                    ) : (
                      'Unknown Patient'
                    )}
                  </TableCell>
                  <TableCell>{formatAmount(bill.finalAmount || bill.totalAmount)}</TableCell>
                  <TableCell>{formatAmount(bill.paidAmount || '0')}</TableCell>
                  <TableCell>{formatAmount(bill.balance || '0')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(bill.paymentStatus || 'pending')}>
                      {(bill.paymentStatus || 'pending').charAt(0).toUpperCase() + (bill.paymentStatus || 'pending').slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bill.dueDate ? formatDate(bill.dueDate) : 'No due date'}
                  </TableCell>
                  <TableCell>
                    {bill.createdAt ? formatDate(bill.createdAt) : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewBill(bill)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditBill(bill)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {bill.paymentStatus !== 'paid' && (
                          <DropdownMenuItem onClick={() => handleProcessPayment(bill)}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Process Payment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteBill(bill)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="!max-w-[1400px] w-[95vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <InvoiceForm
              bill={selectedBill}
              onSuccess={handleBillUpdated}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <PaymentForm
              bill={selectedBill}
              onSuccess={handleBillUpdated}
              onCancel={() => setShowPaymentDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <InvoicePreview bill={selectedBill} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}