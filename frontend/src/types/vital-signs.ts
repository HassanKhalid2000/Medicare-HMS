export enum VitalSignType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  HEART_RATE = 'HEART_RATE',
  TEMPERATURE = 'TEMPERATURE',
  RESPIRATORY_RATE = 'RESPIRATORY_RATE',
  OXYGEN_SATURATION = 'OXYGEN_SATURATION',
  WEIGHT = 'WEIGHT',
  HEIGHT = 'HEIGHT',
  BMI = 'BMI',
  PAIN_SCALE = 'PAIN_SCALE',
}

export interface VitalSign {
  id: string;
  patientId: string;
  medicalRecordId?: string;
  type: VitalSignType;
  value: string;
  unit: string;
  normalRange?: string;
  isAbnormal: boolean;
  notes?: string;
  measuredBy?: string;
  measuredAt: string;
  createdAt: string;
  patient?: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  medicalRecord?: {
    id: string;
    title: string;
    recordType: string;
  };
}

export interface CreateVitalSignDto {
  patientId: string;
  medicalRecordId?: string;
  type: VitalSignType;
  value: string;
  unit: string;
  normalRange?: string;
  isAbnormal?: boolean;
  notes?: string;
  measuredBy?: string;
  measuredAt?: string;
}

export interface UpdateVitalSignDto extends Partial<CreateVitalSignDto> {}

export interface VitalSignsStatistics {
  total: number;
  abnormal: number;
  normal: number;
  abnormalPercentage: number;
  byType: Array<{
    type: VitalSignType;
    count: number;
  }>;
}

export const vitalSignTypeLabels: Record<VitalSignType, string> = {
  [VitalSignType.BLOOD_PRESSURE]: 'Blood Pressure',
  [VitalSignType.HEART_RATE]: 'Heart Rate',
  [VitalSignType.TEMPERATURE]: 'Temperature',
  [VitalSignType.RESPIRATORY_RATE]: 'Respiratory Rate',
  [VitalSignType.OXYGEN_SATURATION]: 'Oxygen Saturation',
  [VitalSignType.WEIGHT]: 'Weight',
  [VitalSignType.HEIGHT]: 'Height',
  [VitalSignType.BMI]: 'Body Mass Index',
  [VitalSignType.PAIN_SCALE]: 'Pain Scale',
};

export const vitalSignUnits: Record<VitalSignType, string> = {
  [VitalSignType.BLOOD_PRESSURE]: 'mmHg',
  [VitalSignType.HEART_RATE]: 'bpm',
  [VitalSignType.TEMPERATURE]: '°C',
  [VitalSignType.RESPIRATORY_RATE]: 'breaths/min',
  [VitalSignType.OXYGEN_SATURATION]: '%',
  [VitalSignType.WEIGHT]: 'kg',
  [VitalSignType.HEIGHT]: 'cm',
  [VitalSignType.BMI]: 'kg/m²',
  [VitalSignType.PAIN_SCALE]: '/10',
};

export const vitalSignIcons: Record<VitalSignType, string> = {
  [VitalSignType.BLOOD_PRESSURE]: '🩸',
  [VitalSignType.HEART_RATE]: '💓',
  [VitalSignType.TEMPERATURE]: '🌡️',
  [VitalSignType.RESPIRATORY_RATE]: '🫁',
  [VitalSignType.OXYGEN_SATURATION]: '🩸',
  [VitalSignType.WEIGHT]: '⚖️',
  [VitalSignType.HEIGHT]: '📏',
  [VitalSignType.BMI]: '📊',
  [VitalSignType.PAIN_SCALE]: '😣',
};