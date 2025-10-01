'use client';

import { useState } from 'react';
import { BillList } from '@/components/billing/bill-list';
import { InvoiceForm } from '@/components/billing/invoice-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export default function BillingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleCreateNew = () => {
    setViewMode('create');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  const handleSuccess = () => {
    setViewMode('list');
  };

  if (viewMode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create New Invoice</h2>
            <p className="text-muted-foreground">
              Create a new invoice for patient billing.
            </p>
          </div>
        </div>

        <InvoiceForm onSuccess={handleSuccess} onCancel={handleBackToList} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BillList onCreateNew={handleCreateNew} />
    </div>
  );
}