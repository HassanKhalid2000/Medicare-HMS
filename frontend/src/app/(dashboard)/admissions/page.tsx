'use client';

import { useState } from 'react';
import { AdmissionsList } from '@/components/admissions/admissions-list';
import { AdmissionForm } from '@/components/admissions/admission-form';
import { AdmissionDetails } from '@/components/admissions/admission-details';
import { AdmissionsStats } from '@/components/admissions/admissions-stats';
import { Admission } from '@/types/admission';

export default function AdmissionsPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'details'>('list');
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  const handleCreateAdmission = () => {
    setSelectedAdmission(null);
    setView('create');
  };

  const handleEditAdmission = (admission: Admission) => {
    setSelectedAdmission(admission);
    setView('edit');
  };

  const handleViewAdmission = (admission: Admission) => {
    setSelectedAdmission(admission);
    setView('details');
  };

  const handleBackToList = () => {
    setSelectedAdmission(null);
    setView('list');
  };

  const handleAdmissionSaved = () => {
    setView('list');
    setSelectedAdmission(null);
  };

  return (
    <div className="space-y-6">
      {view === 'list' && (
        <>
          <AdmissionsStats />
          <AdmissionsList
            onCreateAdmission={handleCreateAdmission}
            onEditAdmission={handleEditAdmission}
            onViewAdmission={handleViewAdmission}
          />
        </>
      )}

      {(view === 'create' || view === 'edit') && (
        <AdmissionForm
          admission={selectedAdmission}
          onBack={handleBackToList}
          onSaved={handleAdmissionSaved}
        />
      )}

      {view === 'details' && selectedAdmission && (
        <AdmissionDetails
          admission={selectedAdmission}
          onBack={handleBackToList}
          onEdit={() => handleEditAdmission(selectedAdmission)}
        />
      )}
    </div>
  );
}