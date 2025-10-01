'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VitalSign, VitalSignType, vitalSignTypeLabels, vitalSignIcons } from '@/types/vital-signs';

interface VitalSignsListProps {
  patientId?: string;
  onEdit?: (vitalSign: VitalSign) => void;
  onDelete?: (id: string) => void;
  showPatientInfo?: boolean;
}

export function VitalSignsList({ patientId, onEdit, onDelete, showPatientInfo = true }: VitalSignsListProps) {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<VitalSignType | 'all'>('all');
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);

  useEffect(() => {
    const loadVitalSigns = async () => {
      try {
        setLoading(true);
        const { vitalSignsService } = await import('@/services/vital-signs');

        if (showAbnormalOnly) {
          const abnormalSigns = await vitalSignsService.getAbnormal({ patientId, limit: 50 });
          setVitalSigns(abnormalSigns);
        } else {
          const filters: any = { limit: 50 };
          if (patientId) filters.patientId = patientId;
          if (filterType !== 'all') filters.type = filterType;

          const allSigns = await vitalSignsService.getAll(filters);
          setVitalSigns(allSigns);
        }
      } catch (error) {
        console.error('Error loading vital signs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVitalSigns();
  }, [patientId, filterType, showAbnormalOnly]);

  const filteredVitalSigns = vitalSigns.filter((vitalSign) => {
    const matchesSearch = !searchTerm ||
      vitalSign.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vitalSign.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vitalSign.patient?.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vitalSign.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vitalSign.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vital sign record?')) {
      try {
        const { vitalSignsService } = await import('@/services/vital-signs');
        await vitalSignsService.delete(id);
        setVitalSigns(vitalSigns.filter(vs => vs.id !== id));
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error('Error deleting vital sign:', error);
        alert('Error deleting vital sign record');
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Vital Signs Records</CardTitle>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search vital signs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterType} onValueChange={(value) => setFilterType(value as VitalSignType | 'all')}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(vitalSignTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showAbnormalOnly ? "default" : "outline"}
            onClick={() => setShowAbnormalOnly(!showAbnormalOnly)}
            className="whitespace-nowrap"
          >
            {showAbnormalOnly ? 'Show All' : 'Abnormal Only'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredVitalSigns.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredVitalSigns.map((vitalSign) => (
              <div key={vitalSign.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">
                        {vitalSignIcons[vitalSign.type]}
                      </span>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {vitalSignTypeLabels[vitalSign.type]}
                        </h3>
                        {showPatientInfo && vitalSign.patient && (
                          <p className="text-sm text-gray-600">
                            Patient: {vitalSign.patient.firstName} {vitalSign.patient.lastName}
                            ({vitalSign.patient.patientId})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Value:</span>
                        <p className="text-lg font-semibold">
                          {vitalSign.value} {vitalSign.unit}
                        </p>
                      </div>

                      {vitalSign.normalRange && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Normal Range:</span>
                          <p className="text-sm">{vitalSign.normalRange}</p>
                        </div>
                      )}

                      <div>
                        <span className="text-sm font-medium text-gray-500">Measured:</span>
                        <p className="text-sm">
                          {format(new Date(vitalSign.measuredAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>

                      {vitalSign.measuredBy && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Measured By:</span>
                          <p className="text-sm">{vitalSign.measuredBy}</p>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <Badge
                          variant={vitalSign.isAbnormal ? "destructive" : "default"}
                          className={vitalSign.isAbnormal ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                        >
                          {vitalSign.isAbnormal ? 'Abnormal' : 'Normal'}
                        </Badge>
                      </div>
                    </div>

                    {vitalSign.notes && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Notes:</span>
                        <p className="text-sm mt-1">{vitalSign.notes}</p>
                      </div>
                    )}

                    {vitalSign.medicalRecord && (
                      <div className="text-sm text-gray-600">
                        Related to: {vitalSign.medicalRecord.title} ({vitalSign.medicalRecord.recordType})
                      </div>
                    )}
                  </div>

                  {(onEdit || onDelete) && (
                    <div className="flex space-x-2 ml-4">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(vitalSign)}
                        >
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(vitalSign.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg mb-2">No vital signs found</p>
            <p className="text-sm">
              {showAbnormalOnly
                ? 'No abnormal vital signs match your criteria'
                : 'No vital signs have been recorded yet'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}