'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { allergiesApi, type Allergy, type AllergyFilters } from '@/lib/api/allergies';
import { CreateAllergyDialog } from '@/components/allergies/CreateAllergyDialog';
import { AllergyDetailsDialog } from '@/components/allergies/AllergyDetailsDialog';
import { toast } from 'sonner';

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AllergyFilters>({
    page: 1,
    limit: 10,
    isActive: true,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<Allergy | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllergies();
  }, [filters]);

  const loadAllergies = async () => {
    try {
      setLoading(true);
      const response = await allergiesApi.getAllergies(filters);
      setAllergies(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      toast.error('Failed to load allergies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value === 'all' ? undefined : value,
      page: 1,
    });
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'medication':
      case 'drug':
        return 'bg-red-100 text-red-800';
      case 'food':
        return 'bg-orange-100 text-orange-800';
      case 'environmental':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Allergies</h1>
          <p className="text-muted-foreground">Manage patient allergy records</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Allergy
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search allergies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Medication">Medication</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Environmental">Environmental</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.severity || 'all'}
              onValueChange={(value) => handleFilterChange('severity', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="Mild">Mild</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Severe">Severe</SelectItem>
                <SelectItem value="Life-threatening">Life-threatening</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.isActive?.toString() || 'true'}
              onValueChange={(value) =>
                handleFilterChange('isActive', value === 'all' ? 'all' : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : allergies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No allergies found
            </div>
          ) : (
            <div className="space-y-4">
              {allergies.map((allergy) => (
                <Card
                  key={allergy.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedAllergy(allergy)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <h3 className="font-semibold text-lg">{allergy.allergen}</h3>
                          <Badge className={getCategoryColor(allergy.category)}>
                            {allergy.category}
                          </Badge>
                          <Badge variant={getSeverityColor(allergy.severity)}>
                            {allergy.severity}
                          </Badge>
                          {!allergy.isActive && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Patient</p>
                            <p className="font-medium">
                              {allergy.patient.firstName} {allergy.patient.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              MRN: {allergy.patient.mrn}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reaction</p>
                            <p className="font-medium line-clamp-2">{allergy.reaction}</p>
                          </div>
                        </div>
                        {allergy.diagnosedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Diagnosed: {new Date(allergy.diagnosedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={filters.page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAllergyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          loadAllergies();
          setShowCreateDialog(false);
        }}
      />

      {selectedAllergy && (
        <AllergyDetailsDialog
          allergy={selectedAllergy}
          open={!!selectedAllergy}
          onOpenChange={(open) => !open && setSelectedAllergy(null)}
          onUpdate={loadAllergies}
        />
      )}
    </div>
  );
}
