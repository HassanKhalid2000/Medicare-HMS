'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { pharmacyService, Medicine, CreateMedicineDto, UpdateMedicineDto } from '@/services/pharmacy';
import { toast } from 'sonner';
import { Search, Plus, Eye, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { MedicineForm } from '@/components/pharmacy/medicine-form';

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const limit = 10;

  const loadMedicines = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await pharmacyService.getMedicines({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        lowStock: lowStockFilter || undefined,
      });
      setMedicines(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to load medicines:', error);
      toast.error('Failed to load medicines');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, lowStockFilter]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (medicine: Medicine) => {
    try {
      const fullMedicine = await pharmacyService.getMedicine(medicine.id);
      setSelectedMedicine(fullMedicine);
      setShowDetailsDialog(true);
    } catch (error) {
      toast.error('Failed to load medicine details');
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsEditing(true);
    setShowFormDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await pharmacyService.deleteMedicine(id);
      toast.success('Medicine deleted successfully');
      loadMedicines();
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isLowStock = (medicine: Medicine) => medicine.quantity <= medicine.minimumStock;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pharmacy</h2>
        <p className="text-muted-foreground">Manage medicine inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicines</CardTitle>
          <CardDescription>Search and filter medicines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, category, or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter || 'all'} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Analgesic">Analgesic</SelectItem>
                  <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                  <SelectItem value="Antiseptic">Antiseptic</SelectItem>
                  <SelectItem value="Antiviral">Antiviral</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => { setSelectedMedicine(null); setIsEditing(false); setShowFormDialog(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                New Medicine
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : medicines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No medicines found</div>
          ) : (
            <div className="space-y-4">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{medicine.name}</h3>
                      <Badge variant="outline">{medicine.category}</Badge>
                      {isLowStock(medicine) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      )}
                      {isExpired(medicine.expiryDate) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{medicine.manufacturer}</span>
                      {' • '}
                      <span>Batch: {medicine.batchNumber}</span>
                      {' • '}
                      <span>Stock: {medicine.quantity}</span>
                      {' • '}
                      <span>Expires: {format(new Date(medicine.expiryDate), 'MMM dd, yyyy')}</span>
                      {' • '}
                      <span className="text-green-600">${medicine.unitPrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(medicine)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(medicine)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(medicine.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, total)} of {total} medicines
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medicine Details</DialogTitle>
          </DialogHeader>
          {selectedMedicine && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{selectedMedicine.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-sm">{selectedMedicine.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                  <p className="text-sm">{selectedMedicine.manufacturer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                  <p className="text-sm">{selectedMedicine.batchNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                  <p className="text-sm">{selectedMedicine.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unit Price</label>
                  <p className="text-sm">${selectedMedicine.unitPrice}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Stock</label>
                  <p className="text-sm">{selectedMedicine.minimumStock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <p className="text-sm">{format(new Date(selectedMedicine.expiryDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              {selectedMedicine.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{selectedMedicine.description}</p>
                </div>
              )}
              {selectedMedicine.dosageInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dosage Information</label>
                  <p className="text-sm mt-1">{selectedMedicine.dosageInfo}</p>
                </div>
              )}
              {selectedMedicine.sideEffects && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Side Effects</label>
                  <p className="text-sm mt-1">{selectedMedicine.sideEffects}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update medicine information' : 'Add a new medicine to inventory'}
            </DialogDescription>
          </DialogHeader>
          <MedicineForm
            medicine={selectedMedicine}
            onSuccess={() => {
              setShowFormDialog(false);
              setSelectedMedicine(null);
              setIsEditing(false);
              loadMedicines();
            }}
            onCancel={() => {
              setShowFormDialog(false);
              setSelectedMedicine(null);
              setIsEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
