'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VitalSignsForm } from '@/components/vital-signs/vital-signs-form';
import { VitalSignsList } from '@/components/vital-signs/vital-signs-list';
import { VitalSignsStats } from '@/components/vital-signs/vital-signs-stats';
import { CreateVitalSignDto, VitalSign } from '@/types/vital-signs';

export default function VitalSignsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedVitalSign, setSelectedVitalSign] = useState<VitalSign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateVitalSign = async (data: CreateVitalSignDto) => {
    try {
      setIsLoading(true);
      const { vitalSignsService } = await import('@/services/vital-signs');
      await vitalSignsService.create(data);
      setShowForm(false);
      setRefreshTrigger(prev => prev + 1);
      alert('Vital signs recorded successfully!');
    } catch (error) {
      console.error('Error creating vital sign:', error);
      alert('Error recording vital signs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVitalSign = (vitalSign: VitalSign) => {
    setSelectedVitalSign(vitalSign);
    setShowForm(true);
  };

  const handleDeleteVitalSign = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedVitalSign(null);
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vital Signs Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Track and monitor patient vital signs with real-time analysis
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          📊 Record Vital Signs
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <VitalSignsForm
              onSubmit={handleCreateVitalSign}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
          <TabsTrigger value="abnormal">Abnormal Values</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics */}
          <VitalSignsStats />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-blue-900 mb-2">Record Vitals</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Record new vital signs for patients
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Start Recording
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">⚠️</div>
                <h3 className="font-semibold text-green-900 mb-2">Abnormal Values</h3>
                <p className="text-sm text-green-700 mb-4">
                  Review abnormal vital signs requiring attention
                </p>
                <Button
                  onClick={() => {
                    const tabs = document.querySelector('[data-value="abnormal"]') as HTMLElement;
                    tabs?.click();
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  View Abnormal
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-purple-900 mb-2">Analytics</h3>
                <p className="text-sm text-purple-700 mb-4">
                  View trends and detailed analytics
                </p>
                <Button
                  onClick={() => {
                    const tabs = document.querySelector('[data-value="analytics"]') as HTMLElement;
                    tabs?.click();
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <VitalSignsList
                onEdit={handleEditVitalSign}
                onDelete={handleDeleteVitalSign}
                showPatientInfo={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <VitalSignsList
            onEdit={handleEditVitalSign}
            onDelete={handleDeleteVitalSign}
            showPatientInfo={true}
          />
        </TabsContent>

        <TabsContent value="abnormal">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">⚠️ Abnormal Vital Signs</CardTitle>
              <p className="text-sm text-gray-600">
                Vital signs that fall outside normal ranges and require attention
              </p>
            </CardHeader>
            <CardContent>
              <VitalSignsList
                onEdit={handleEditVitalSign}
                onDelete={handleDeleteVitalSign}
                showPatientInfo={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <VitalSignsStats days={90} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Advanced analytics coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">📈</div>
                  <p>Trend analysis coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}