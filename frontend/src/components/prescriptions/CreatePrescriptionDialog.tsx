'use client';

import { PrescriptionForm } from './prescription-form';

interface CreatePrescriptionDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreatePrescriptionDialog({ onSuccess, onCancel }: CreatePrescriptionDialogProps) {
  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <PrescriptionForm
        onBack={onCancel}
        onSaved={onSuccess}
      />
    </div>
  );
}
