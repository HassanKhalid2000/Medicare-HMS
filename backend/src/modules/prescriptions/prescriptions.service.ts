import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { MedicalPrescription } from '@prisma/client';

interface PrescriptionFilters {
  page: number;
  limit: number;
  patientId?: string;
  medicalRecordId?: string;
  isActive?: boolean;
  search?: string;
}

interface PatientPrescriptionFilters {
  page: number;
  limit: number;
  isActive?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  dosageInfo: string;
  sideEffects: string;
  interactions: string;
}

export interface DrugInteraction {
  medicine1: Medicine;
  medicine2: Medicine;
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CONTRAINDICATED';
  description: string;
  recommendation: string;
}

// Mock medicines database - In production, this would come from a pharmaceutical database
const MEDICINES_DATABASE: Medicine[] = [
  {
    id: '1',
    name: 'Aspirin',
    category: 'Pain Relief',
    manufacturer: 'Generic',
    dosageInfo: '325mg tablets',
    sideEffects: 'Stomach irritation, bleeding',
    interactions: 'warfarin,clopidogrel,ibuprofen'
  },
  {
    id: '2',
    name: 'Warfarin',
    category: 'Anticoagulant',
    manufacturer: 'Coumadin',
    dosageInfo: '5mg tablets',
    sideEffects: 'Bleeding, bruising',
    interactions: 'aspirin,ibuprofen,amoxicillin'
  },
  {
    id: '3',
    name: 'Ibuprofen',
    category: 'NSAID',
    manufacturer: 'Advil',
    dosageInfo: '200mg tablets',
    sideEffects: 'Stomach upset, kidney problems',
    interactions: 'warfarin,aspirin,lisinopril'
  },
  {
    id: '4',
    name: 'Lisinopril',
    category: 'ACE Inhibitor',
    manufacturer: 'Prinivil',
    dosageInfo: '10mg tablets',
    sideEffects: 'Dry cough, dizziness',
    interactions: 'ibuprofen,potassium,spironolactone'
  },
  {
    id: '5',
    name: 'Metformin',
    category: 'Diabetes',
    manufacturer: 'Glucophage',
    dosageInfo: '500mg tablets',
    sideEffects: 'Nausea, diarrhea',
    interactions: 'alcohol,contrast_dye'
  },
  {
    id: '6',
    name: 'Atorvastatin',
    category: 'Statin',
    manufacturer: 'Lipitor',
    dosageInfo: '20mg tablets',
    sideEffects: 'Muscle pain, liver problems',
    interactions: 'clarithromycin,grapefruit_juice'
  },
  {
    id: '7',
    name: 'Amlodipine',
    category: 'Calcium Channel Blocker',
    manufacturer: 'Norvasc',
    dosageInfo: '5mg tablets',
    sideEffects: 'Swelling, dizziness',
    interactions: 'grapefruit_juice,simvastatin'
  },
  {
    id: '8',
    name: 'Omeprazole',
    category: 'Proton Pump Inhibitor',
    manufacturer: 'Prilosec',
    dosageInfo: '20mg capsules',
    sideEffects: 'Headache, stomach pain',
    interactions: 'warfarin,clopidogrel'
  },
  {
    id: '9',
    name: 'Levothyroxine',
    category: 'Thyroid Hormone',
    manufacturer: 'Synthroid',
    dosageInfo: '50mcg tablets',
    sideEffects: 'Heart palpitations, nervousness',
    interactions: 'calcium,iron,coffee'
  },
  {
    id: '10',
    name: 'Clopidogrel',
    category: 'Antiplatelet',
    manufacturer: 'Plavix',
    dosageInfo: '75mg tablets',
    sideEffects: 'Bleeding, bruising',
    interactions: 'warfarin,aspirin,omeprazole'
  }
];

// Drug interaction rules
const DRUG_INTERACTIONS: { [key: string]: DrugInteraction } = {
  'aspirin-warfarin': {
    medicine1: MEDICINES_DATABASE[0],
    medicine2: MEDICINES_DATABASE[1],
    severity: 'MAJOR',
    description: 'Increased risk of bleeding when used together',
    recommendation: 'Monitor for signs of bleeding. Consider alternative pain relief.'
  },
  'warfarin-ibuprofen': {
    medicine1: MEDICINES_DATABASE[1],
    medicine2: MEDICINES_DATABASE[2],
    severity: 'MAJOR',
    description: 'Significantly increased bleeding risk',
    recommendation: 'Avoid concurrent use. Use acetaminophen for pain relief instead.'
  },
  'ibuprofen-lisinopril': {
    medicine1: MEDICINES_DATABASE[2],
    medicine2: MEDICINES_DATABASE[3],
    severity: 'MODERATE',
    description: 'May reduce effectiveness of ACE inhibitor and increase kidney problems',
    recommendation: 'Monitor blood pressure and kidney function regularly.'
  },
  'aspirin-clopidogrel': {
    medicine1: MEDICINES_DATABASE[0],
    medicine2: MEDICINES_DATABASE[9],
    severity: 'MAJOR',
    description: 'Dual antiplatelet therapy increases bleeding risk significantly',
    recommendation: 'Only use together under close medical supervision for specific conditions.'
  }
};

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<MedicalPrescription> {
    // Verify that the medical record exists
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: createPrescriptionDto.medicalRecordId },
      include: { patient: true }
    });

    if (!medicalRecord) {
      throw new BadRequestException('Medical record not found');
    }

    // Check if medicine exists in our database
    const medicine = MEDICINES_DATABASE.find(m => m.id === createPrescriptionDto.medicineId);
    if (!medicine) {
      throw new BadRequestException('Medicine not found');
    }

    // Check for drug interactions with existing active prescriptions
    const existingPrescriptions = await this.prisma.medicalPrescription.findMany({
      where: {
        medicalRecord: { patientId: medicalRecord.patientId },
        isActive: true
      }
    });

    const existingMedicineIds = existingPrescriptions.map(p => p.medicineId);
    existingMedicineIds.push(createPrescriptionDto.medicineId);

    const interactions = await this.checkDrugInteractions(existingMedicineIds);
    if (interactions.length > 0) {
      const majorInteractions = interactions.filter(i => i.severity === 'MAJOR' || i.severity === 'CONTRAINDICATED');
      if (majorInteractions.length > 0) {
        console.warn(`Major drug interactions detected: ${majorInteractions.map(i => i.description).join(', ')}`);
      }
    }

    const prescription = await this.prisma.medicalPrescription.create({
      data: {
        ...createPrescriptionDto,
        medicineId: createPrescriptionDto.medicineId,
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });

    return prescription;
  }

  async checkDrugInteractions(medicineIds: string[]): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = [];

    // Check all pairs of medicines
    for (let i = 0; i < medicineIds.length; i++) {
      for (let j = i + 1; j < medicineIds.length; j++) {
        const medicine1 = MEDICINES_DATABASE.find(m => m.id === medicineIds[i]);
        const medicine2 = MEDICINES_DATABASE.find(m => m.id === medicineIds[j]);

        if (!medicine1 || !medicine2) continue;

        // Check both directions for interactions
        const key1 = `${medicine1.name.toLowerCase()}-${medicine2.name.toLowerCase()}`;
        const key2 = `${medicine2.name.toLowerCase()}-${medicine1.name.toLowerCase()}`;

        const interaction = DRUG_INTERACTIONS[key1] || DRUG_INTERACTIONS[key2];
        if (interaction) {
          interactions.push(interaction);
        }
      }
    }

    return interactions;
  }

  async searchMedicines(query: string, limit: number = 20): Promise<Medicine[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();

    // Query the actual Medicine table from database
    const medicines = await this.prisma.medicine.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
          { manufacturer: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        manufacturer: true,
        dosageInfo: true,
        sideEffects: true,
      },
    });

    // Transform to match Medicine interface (add empty interactions field)
    return medicines.map(med => ({
      ...med,
      interactions: '',
    }));
  }

  async findAll(filters: PrescriptionFilters) {
    const { page, limit, patientId, medicalRecordId, isActive, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (patientId) {
      where.medicalRecord = { patientId };
    }

    if (medicalRecordId) {
      where.medicalRecordId = medicalRecordId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { dosage: { contains: search, mode: 'insensitive' } },
        { frequency: { contains: search, mode: 'insensitive' } },
        { instructions: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.medicalPrescription.findMany({
        where,
        include: {
          medicalRecord: {
            select: {
              id: true,
              title: true,
              recordType: true,
              createdAt: true,
              patient: {
                select: {
                  id: true,
                  patientId: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          }
        },
        orderBy: { prescribedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalPrescription.count({ where }),
    ]);

    // Enhance with medicine information
    const enhancedData = data.map(prescription => {
      const medicine = MEDICINES_DATABASE.find(m => m.id === prescription.medicineId);
      return {
        ...prescription,
        medicine: medicine || {
          id: prescription.medicineId,
          name: 'Unknown Medicine',
          category: 'Unknown',
          manufacturer: 'Unknown',
          dosageInfo: 'Unknown',
          sideEffects: 'Unknown',
          interactions: ''
        }
      };
    });

    return {
      data: enhancedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByMedicalRecord(medicalRecordId: string) {
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId }
    });

    if (!medicalRecord) {
      throw new NotFoundException('Medical record not found');
    }

    const prescriptions = await this.prisma.medicalPrescription.findMany({
      where: { medicalRecordId },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
      orderBy: { prescribedAt: 'desc' },
    });

    // Enhance with medicine information
    return prescriptions.map(prescription => {
      const medicine = MEDICINES_DATABASE.find(m => m.id === prescription.medicineId);
      return {
        ...prescription,
        medicine: medicine || {
          id: prescription.medicineId,
          name: 'Unknown Medicine',
          category: 'Unknown',
          manufacturer: 'Unknown',
          dosageInfo: 'Unknown',
          sideEffects: 'Unknown',
          interactions: ''
        }
      };
    });
  }

  async findByPatient(patientId: string, filters: PatientPrescriptionFilters) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const { page, limit, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = { medicalRecord: { patientId } };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.medicalPrescription.findMany({
        where,
        include: {
          medicalRecord: {
            select: {
              id: true,
              title: true,
              recordType: true,
              createdAt: true,
              patient: {
                select: {
                  id: true,
                  patientId: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          }
        },
        orderBy: { prescribedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalPrescription.count({ where }),
    ]);

    // Enhance with medicine information
    const enhancedData = data.map(prescription => {
      const medicine = MEDICINES_DATABASE.find(m => m.id === prescription.medicineId);
      return {
        ...prescription,
        medicine: medicine || {
          id: prescription.medicineId,
          name: 'Unknown Medicine',
          category: 'Unknown',
          manufacturer: 'Unknown',
          dosageInfo: 'Unknown',
          sideEffects: 'Unknown',
          interactions: ''
        }
      };
    });

    return {
      data: enhancedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<any> {
    const prescription = await this.prisma.medicalPrescription.findUnique({
      where: { id },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
              }
            }
          }
        }
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const medicine = MEDICINES_DATABASE.find(m => m.id === prescription.medicineId);

    return {
      ...prescription,
      medicine: medicine || {
        id: prescription.medicineId,
        name: 'Unknown Medicine',
        category: 'Unknown',
        manufacturer: 'Unknown',
        dosageInfo: 'Unknown',
        sideEffects: 'Unknown',
        interactions: ''
      }
    };
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<any> {
    const prescription = await this.prisma.medicalPrescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const updatedPrescription = await this.prisma.medicalPrescription.update({
      where: { id },
      data: {
        ...updatePrescriptionDto,
        updatedAt: new Date(),
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
    });

    const medicine = MEDICINES_DATABASE.find(m => m.id === updatedPrescription.medicineId);

    return {
      ...updatedPrescription,
      medicine: medicine || {
        id: updatedPrescription.medicineId,
        name: 'Unknown Medicine',
        category: 'Unknown',
        manufacturer: 'Unknown',
        dosageInfo: 'Unknown',
        sideEffects: 'Unknown',
        interactions: ''
      }
    };
  }

  async activate(id: string): Promise<any> {
    const prescription = await this.prisma.medicalPrescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const updatedPrescription = await this.prisma.medicalPrescription.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
    });

    const medicine = MEDICINES_DATABASE.find(m => m.id === updatedPrescription.medicineId);

    return {
      ...updatedPrescription,
      medicine
    };
  }

  async deactivate(id: string): Promise<any> {
    const prescription = await this.prisma.medicalPrescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const updatedPrescription = await this.prisma.medicalPrescription.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
    });

    const medicine = MEDICINES_DATABASE.find(m => m.id === updatedPrescription.medicineId);

    return {
      ...updatedPrescription,
      medicine
    };
  }

  async dispensePrescription(id: string): Promise<any> {
    const prescription = await this.prisma.medicalPrescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.refills <= 0) {
      throw new BadRequestException('No refills remaining');
    }

    const updatedPrescription = await this.prisma.medicalPrescription.update({
      where: { id },
      data: {
        refills: prescription.refills - 1,
        updatedAt: new Date(),
      },
      include: {
        medicalRecord: {
          select: {
            id: true,
            title: true,
            recordType: true,
            createdAt: true,
            patient: {
              select: {
                id: true,
                patientId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
    });

    const medicine = MEDICINES_DATABASE.find(m => m.id === updatedPrescription.medicineId);

    return {
      ...updatedPrescription,
      medicine
    };
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.prisma.medicalPrescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    await this.prisma.medicalPrescription.delete({
      where: { id },
    });
  }
}