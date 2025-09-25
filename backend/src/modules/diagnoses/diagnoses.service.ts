import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { Diagnosis, DiagnosisType } from '@prisma/client';

interface DiagnosisFilters {
  page: number;
  limit: number;
  patientId?: string;
  medicalRecordId?: string;
  type?: string;
  isActive?: boolean;
  search?: string;
}

interface PatientDiagnosisFilters {
  page: number;
  limit: number;
  type?: string;
  isActive?: boolean;
}

// Mock ICD-10 codes for demonstration - In production, this would come from a medical database
const ICD10_CODES = [
  { code: 'A00', description: 'Cholera' },
  { code: 'A01.0', description: 'Typhoid fever' },
  { code: 'A01.1', description: 'Paratyphoid fever A' },
  { code: 'A01.2', description: 'Paratyphoid fever B' },
  { code: 'A01.3', description: 'Paratyphoid fever C' },
  { code: 'A01.4', description: 'Paratyphoid fever, unspecified' },
  { code: 'A02.0', description: 'Salmonella enteritis' },
  { code: 'A02.1', description: 'Salmonella sepsis' },
  { code: 'A02.2', description: 'Localized salmonella infections' },
  { code: 'A02.8', description: 'Other specified salmonella infections' },
  { code: 'A02.9', description: 'Salmonella infection, unspecified' },
  { code: 'B00.0', description: 'Eczema herpeticum' },
  { code: 'B00.1', description: 'Herpesviral vesicular dermatitis' },
  { code: 'B00.2', description: 'Herpesviral gingivostomatitis and pharyngotonsillitis' },
  { code: 'C78.0', description: 'Secondary malignant neoplasm of lung' },
  { code: 'C78.1', description: 'Secondary malignant neoplasm of mediastinum' },
  { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'F32.0', description: 'Mild depressive episode' },
  { code: 'F32.1', description: 'Moderate depressive episode' },
  { code: 'F32.2', description: 'Severe depressive episode without psychotic symptoms' },
  { code: 'F32.3', description: 'Severe depressive episode with psychotic symptoms' },
  { code: 'G43.0', description: 'Migraine without aura' },
  { code: 'G43.1', description: 'Migraine with aura' },
  { code: 'I10', description: 'Essential hypertension' },
  { code: 'I25.9', description: 'Chronic ischemic heart disease, unspecified' },
  { code: 'J44.0', description: 'Chronic obstructive pulmonary disease with acute lower respiratory infection' },
  { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation' },
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
  { code: 'M79.3', description: 'Panniculitis, unspecified' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
  { code: 'R06.0', description: 'Dyspnea' },
  { code: 'R50.9', description: 'Fever, unspecified' },
  { code: 'Z51.1', description: 'Encounter for antineoplastic chemotherapy' },
];

@Injectable()
export class DiagnosesService {
  constructor(private prisma: PrismaService) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    // Verify that the medical record exists
    const medicalRecord = await this.prisma.medicalRecord.findUnique({
      where: { id: createDiagnosisDto.medicalRecordId },
      include: { patient: true }
    });

    if (!medicalRecord) {
      throw new BadRequestException('Medical record not found');
    }

    // Validate ICD-10 code if provided
    if (createDiagnosisDto.icd10Code) {
      const isValidCode = ICD10_CODES.some(code =>
        code.code.toLowerCase() === createDiagnosisDto.icd10Code.toLowerCase()
      );
      if (!isValidCode) {
        console.warn(`ICD-10 code ${createDiagnosisDto.icd10Code} not found in database`);
      }
    }

    const diagnosis = await this.prisma.diagnosis.create({
      data: createDiagnosisDto,
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

    return diagnosis;
  }

  async findAll(filters: DiagnosisFilters) {
    const { page, limit, patientId, medicalRecordId, type, isActive, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (patientId) {
      where.medicalRecord = { patientId };
    }

    if (medicalRecordId) {
      where.medicalRecordId = medicalRecordId;
    }

    if (type && type !== 'all') {
      where.type = type as DiagnosisType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { icd10Code: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.diagnosis.findMany({
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
        orderBy: { diagnosedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.diagnosis.count({ where }),
    ]);

    return {
      data,
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

    return this.prisma.diagnosis.findMany({
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
      orderBy: { diagnosedAt: 'desc' },
    });
  }

  async findByPatient(patientId: string, filters: PatientDiagnosisFilters) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const { page, limit, type, isActive } = filters;
    const skip = (page - 1) * limit;

    const where: any = { medicalRecord: { patientId } };

    if (type && type !== 'all') {
      where.type = type as DiagnosisType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.diagnosis.findMany({
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
        orderBy: { diagnosedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.diagnosis.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchICD10Codes(query: string, limit: number = 20) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();

    return ICD10_CODES
      .filter(code =>
        code.code.toLowerCase().includes(searchTerm) ||
        code.description.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit)
      .map(code => ({
        code: code.code,
        description: code.description,
        display: `${code.code} - ${code.description}`
      }));
  }

  async findOne(id: string): Promise<Diagnosis> {
    const diagnosis = await this.prisma.diagnosis.findUnique({
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

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    return diagnosis;
  }

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    // Validate ICD-10 code if provided
    if (updateDiagnosisDto.icd10Code) {
      const isValidCode = ICD10_CODES.some(code =>
        code.code.toLowerCase() === updateDiagnosisDto.icd10Code.toLowerCase()
      );
      if (!isValidCode) {
        console.warn(`ICD-10 code ${updateDiagnosisDto.icd10Code} not found in database`);
      }
    }

    return this.prisma.diagnosis.update({
      where: { id },
      data: {
        ...updateDiagnosisDto,
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
  }

  async resolve(id: string): Promise<Diagnosis> {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    return this.prisma.diagnosis.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
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
  }

  async activate(id: string): Promise<Diagnosis> {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    return this.prisma.diagnosis.update({
      where: { id },
      data: {
        isActive: true,
        resolvedAt: null,
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
  }

  async deactivate(id: string): Promise<Diagnosis> {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    return this.prisma.diagnosis.update({
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
  }

  async remove(id: string): Promise<void> {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id },
    });

    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }

    await this.prisma.diagnosis.delete({
      where: { id },
    });
  }
}