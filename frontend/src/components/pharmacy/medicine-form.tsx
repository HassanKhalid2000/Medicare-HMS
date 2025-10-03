'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { pharmacyService, Medicine, CreateMedicineDto, UpdateMedicineDto } from '@/services/pharmacy';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MedicineFormProps {
  medicine?: Medicine | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MedicineForm({ medicine, onSuccess, onCancel }: MedicineFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    category: medicine?.category || '',
    manufacturer: medicine?.manufacturer || '',
    batchNumber: medicine?.batchNumber || '',
    expiryDate: medicine?.expiryDate ? medicine.expiryDate.split('T')[0] : '',
    quantity: medicine?.quantity || 0,
    unitPrice: medicine?.unitPrice || '',
    minimumStock: medicine?.minimumStock || 10,
    description: medicine?.description || '',
    sideEffects: medicine?.sideEffects || '',
    dosageInfo: medicine?.dosageInfo || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.manufacturer || !formData.batchNumber || !formData.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      if (medicine) {
        const updateData: UpdateMedicineDto = {
          name: formData.name,
          category: formData.category,
          manufacturer: formData.manufacturer,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate,
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice),
          minimumStock: Number(formData.minimumStock),
          description: formData.description || undefined,
          sideEffects: formData.sideEffects || undefined,
          dosageInfo: formData.dosageInfo || undefined,
        };

        await pharmacyService.updateMedicine(medicine.id, updateData);
        toast.success('Medicine updated successfully');
      } else {
        const createData: CreateMedicineDto = {
          name: formData.name,
          category: formData.category,
          manufacturer: formData.manufacturer,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate,
          quantity: Number(formData.quantity),
          unitPrice: Number(formData.unitPrice),
          minimumStock: Number(formData.minimumStock),
          description: formData.description || undefined,
          sideEffects: formData.sideEffects || undefined,
          dosageInfo: formData.dosageInfo || undefined,
        };

        await pharmacyService.createMedicine(createData);
        toast.success('Medicine added successfully');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Failed to save medicine:', error);
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Medicine Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer *</Label>
          <Input
            id="manufacturer"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date *</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price ($) *</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minimumStock">Minimum Stock</Label>
          <Input
            id="minimumStock"
            type="number"
            min="0"
            value={formData.minimumStock}
            onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosageInfo">Dosage Information</Label>
        <Textarea
          id="dosageInfo"
          value={formData.dosageInfo}
          onChange={(e) => setFormData({ ...formData, dosageInfo: e.target.value })}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sideEffects">Side Effects</Label>
        <Textarea
          id="sideEffects"
          value={formData.sideEffects}
          onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
          disabled={isLoading}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {medicine ? 'Update' : 'Add'} Medicine
        </Button>
      </div>
    </form>
  );
}
