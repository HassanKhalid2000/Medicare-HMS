'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Search } from 'lucide-react';
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
import {
  templatesApi,
  type MedicalTemplate,
  type TemplateQueryParams,
  MedicalTemplateCategory,
  MedicalTemplateType,
} from '@/lib/api/templates';
import { toast } from 'sonner';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<MedicalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TemplateQueryParams>({
    page: 1,
    limit: 10,
    isActive: true,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [filters]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesApi.getAll(filters);
      setTemplates(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to load templates');
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

  const getCategoryColor = (category: MedicalTemplateCategory) => {
    const colors: Record<string, string> = {
      PRESCRIPTION: 'bg-blue-100 text-blue-800',
      DIAGNOSIS: 'bg-purple-100 text-purple-800',
      MEDICAL_REPORT: 'bg-green-100 text-green-800',
      LAB_ORDER: 'bg-yellow-100 text-yellow-800',
      DISCHARGE_SUMMARY: 'bg-orange-100 text-orange-800',
      CONSENT_FORM: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medical Templates</h1>
          <p className="text-muted-foreground">Manage reusable medical document templates</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(MedicalTemplateCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.templateType || 'all'}
              onValueChange={(value) => handleFilterChange('templateType', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.values(MedicalTemplateType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate mb-2">{template.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline">{template.templateType}</Badge>
                          {template.isSystem && (
                            <Badge variant="secondary">System</Badge>
                          )}
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        )}
                        {template.specialization && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {template.specialization}
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
    </div>
  );
}
