import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create demo users as specified in PRD
  console.log('👥 Creating demo users...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@medicore.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@medicore.com',
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      department: 'Administration',
      employeeId: 'ADM001',
      status: 'active',
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@medicore.com' },
    update: {},
    create: {
      fullName: 'Doctor User',
      email: 'doctor@medicore.com',
      passwordHash: hashedPassword,
      role: 'doctor',
      phone: '+1234567891',
      department: 'Cardiology',
      employeeId: 'DOC001',
      status: 'active',
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: 'nurse@medicore.com' },
    update: {},
    create: {
      fullName: 'Nurse User',
      email: 'nurse@medicore.com',
      passwordHash: hashedPassword,
      role: 'nurse',
      phone: '+1234567892',
      department: 'Emergency',
      employeeId: 'NUR001',
      status: 'active',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@medicore.com' },
    update: {},
    create: {
      fullName: 'Receptionist User',
      email: 'receptionist@medicore.com',
      passwordHash: hashedPassword,
      role: 'receptionist',
      phone: '+1234567893',
      department: 'Reception',
      employeeId: 'REC001',
      status: 'active',
    },
  });

  // Create demo doctors
  console.log('👨‍⚕️ Creating demo doctors...');

  const doctorProfiles = await Promise.all([
    prisma.doctor.upsert({
      where: { email: 'doctor@medicore.com' },
      update: {},
      create: {
        doctorId: 'DOC001',
        name: 'Doctor User',
        specialization: 'CARDIOLOGY',
        phone: '+1234567891',
        email: 'doctor@medicore.com',
        licenseNumber: 'LIC001',
        experienceYears: 15,
        consultationFee: 150.00,
        schedule: '9:00 AM - 5:00 PM (Mon-Fri)',
        status: 'active',
      },
    }),
    prisma.doctor.upsert({
      where: { email: 'dr.sarah.ahmad@medicore.com' },
      update: {},
      create: {
        doctorId: 'DOC002',
        name: 'Dr. Sarah Ahmad',
        specialization: 'PEDIATRICS',
        phone: '+1234567894',
        email: 'dr.sarah.ahmad@medicore.com',
        licenseNumber: 'LIC002',
        experienceYears: 8,
        consultationFee: 120.00,
        schedule: '8:00 AM - 4:00 PM (Mon-Sat)',
        status: 'active',
      },
    }),
    prisma.doctor.upsert({
      where: { email: 'dr.ahmed.hassan@medicore.com' },
      update: {},
      create: {
        doctorId: 'DOC003',
        name: 'Dr. Ahmed Hassan',
        specialization: 'ORTHOPEDICS',
        phone: '+1234567895',
        email: 'dr.ahmed.hassan@medicore.com',
        licenseNumber: 'LIC003',
        experienceYears: 12,
        consultationFee: 180.00,
        schedule: '10:00 AM - 6:00 PM (Mon-Fri)',
        status: 'active',
      },
    }),
  ]);

  // Create demo patients
  console.log('🏥 Creating demo patients...');

  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { patientId: 'PAT001' },
      update: {},
      create: {
        patientId: 'PAT001',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        phone: '+1234567896',
        address: '123 Main St, City, State',
        emergencyContact: '+1234567897',
        bloodGroup: 'O_POSITIVE',
        medicalHistory: 'No significant medical history',
        allergyNotes: 'None known',
        status: 'active',
      },
    }),
    prisma.patient.upsert({
      where: { patientId: 'PAT002' },
      update: {},
      create: {
        patientId: 'PAT002',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'female',
        phone: '+1234567898',
        address: '456 Oak Ave, City, State',
        emergencyContact: '+1234567899',
        bloodGroup: 'A_POSITIVE',
        medicalHistory: 'Diabetes Type 2',
        allergyNotes: 'Penicillin',
        status: 'active',
      },
    }),
    prisma.patient.upsert({
      where: { patientId: 'PAT003' },
      update: {},
      create: {
        patientId: 'PAT003',
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        dateOfBirth: new Date('1978-12-10'),
        gender: 'male',
        phone: '+1234567800',
        address: '789 Pine St, City, State',
        emergencyContact: '+1234567801',
        bloodGroup: 'B_POSITIVE',
        medicalHistory: 'Hypertension',
        allergyNotes: 'Shellfish',
        status: 'active',
      },
    }),
  ]);

  // Create demo appointments
  console.log('📅 Creating demo appointments...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctorProfiles[0].id,
        appointmentDate: tomorrow,
        appointmentTime: new Date('2024-01-01T09:00:00'),
        type: 'consultation',
        status: 'scheduled',
        notes: 'Regular checkup',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        doctorId: doctorProfiles[1].id,
        appointmentDate: tomorrow,
        appointmentTime: new Date('2024-01-01T10:30:00'),
        type: 'follow_up',
        status: 'confirmed',
        notes: 'Follow-up for diabetes management',
      },
    }),
  ]);

  // Create demo medicines
  console.log('💊 Creating demo medicines...');

  const medicines = await Promise.all([
    prisma.medicine.upsert({
      where: { id: 'med-1' },
      update: {},
      create: {
        id: 'med-1',
        name: 'Aspirin',
        category: 'Pain Relief',
        manufacturer: 'Pharma Corp',
        batchNumber: 'ASP2024001',
        expiryDate: new Date('2025-12-31'),
        quantity: 500,
        unitPrice: 0.50,
        minimumStock: 50,
        description: 'Pain relief and anti-inflammatory medication',
        sideEffects: 'May cause stomach irritation',
        dosageInfo: '1-2 tablets every 4-6 hours as needed',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-2' },
      update: {},
      create: {
        id: 'med-2',
        name: 'Metformin',
        category: 'Diabetes',
        manufacturer: 'Diabetes Solutions',
        batchNumber: 'MET2024001',
        expiryDate: new Date('2025-06-30'),
        quantity: 200,
        unitPrice: 2.50,
        minimumStock: 20,
        description: 'Diabetes medication to control blood sugar',
        sideEffects: 'May cause nausea, diarrhea',
        dosageInfo: '500mg twice daily with meals',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-3' },
      update: {},
      create: {
        id: 'med-3',
        name: 'Amoxicillin',
        category: 'Antibiotic',
        manufacturer: 'MediPharm',
        batchNumber: 'AMO2024001',
        expiryDate: new Date('2025-08-31'),
        quantity: 300,
        unitPrice: 1.20,
        minimumStock: 30,
        description: 'Broad-spectrum antibiotic for bacterial infections',
        sideEffects: 'May cause allergic reactions, diarrhea',
        dosageInfo: '500mg three times daily for 7 days',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-4' },
      update: {},
      create: {
        id: 'med-4',
        name: 'Lisinopril',
        category: 'Cardiovascular',
        manufacturer: 'CardioMed',
        batchNumber: 'LIS2024001',
        expiryDate: new Date('2026-03-31'),
        quantity: 250,
        unitPrice: 1.80,
        minimumStock: 25,
        description: 'ACE inhibitor for high blood pressure',
        sideEffects: 'Dizziness, dry cough, headache',
        dosageInfo: '10mg once daily',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-5' },
      update: {},
      create: {
        id: 'med-5',
        name: 'Omeprazole',
        category: 'Gastrointestinal',
        manufacturer: 'GastroHealth',
        batchNumber: 'OME2024001',
        expiryDate: new Date('2025-10-31'),
        quantity: 400,
        unitPrice: 0.80,
        minimumStock: 40,
        description: 'Proton pump inhibitor for acid reflux and ulcers',
        sideEffects: 'Headache, nausea, abdominal pain',
        dosageInfo: '20mg once daily before breakfast',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-6' },
      update: {},
      create: {
        id: 'med-6',
        name: 'Atorvastatin',
        category: 'Cardiovascular',
        manufacturer: 'CardioMed',
        batchNumber: 'ATO2024001',
        expiryDate: new Date('2026-01-31'),
        quantity: 350,
        unitPrice: 2.20,
        minimumStock: 35,
        description: 'Statin medication to lower cholesterol',
        sideEffects: 'Muscle pain, liver enzyme elevation',
        dosageInfo: '20mg once daily in the evening',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-7' },
      update: {},
      create: {
        id: 'med-7',
        name: 'Ibuprofen',
        category: 'Pain Relief',
        manufacturer: 'Pharma Corp',
        batchNumber: 'IBU2024001',
        expiryDate: new Date('2025-11-30'),
        quantity: 600,
        unitPrice: 0.40,
        minimumStock: 60,
        description: 'NSAID for pain, fever, and inflammation',
        sideEffects: 'Stomach upset, heartburn, dizziness',
        dosageInfo: '400mg every 4-6 hours as needed',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-8' },
      update: {},
      create: {
        id: 'med-8',
        name: 'Levothyroxine',
        category: 'Endocrine',
        manufacturer: 'EndoPharm',
        batchNumber: 'LEV2024001',
        expiryDate: new Date('2026-02-28'),
        quantity: 280,
        unitPrice: 1.50,
        minimumStock: 28,
        description: 'Thyroid hormone replacement',
        sideEffects: 'Heart palpitations if overdosed',
        dosageInfo: '75mcg once daily on empty stomach',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-9' },
      update: {},
      create: {
        id: 'med-9',
        name: 'Azithromycin',
        category: 'Antibiotic',
        manufacturer: 'MediPharm',
        batchNumber: 'AZI2024001',
        expiryDate: new Date('2025-09-30'),
        quantity: 180,
        unitPrice: 3.50,
        minimumStock: 18,
        description: 'Macrolide antibiotic for respiratory infections',
        sideEffects: 'Nausea, diarrhea, stomach pain',
        dosageInfo: '500mg on day 1, then 250mg daily for 4 days',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-10' },
      update: {},
      create: {
        id: 'med-10',
        name: 'Losartan',
        category: 'Cardiovascular',
        manufacturer: 'CardioMed',
        batchNumber: 'LOS2024001',
        expiryDate: new Date('2026-04-30'),
        quantity: 220,
        unitPrice: 1.90,
        minimumStock: 22,
        description: 'ARB medication for hypertension',
        sideEffects: 'Dizziness, back pain, nasal congestion',
        dosageInfo: '50mg once daily',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-11' },
      update: {},
      create: {
        id: 'med-11',
        name: 'Cetirizine',
        category: 'Antihistamine',
        manufacturer: 'AllergyRelief Inc',
        batchNumber: 'CET2024001',
        expiryDate: new Date('2025-07-31'),
        quantity: 450,
        unitPrice: 0.60,
        minimumStock: 45,
        description: 'Antihistamine for allergies and hay fever',
        sideEffects: 'Drowsiness, dry mouth, fatigue',
        dosageInfo: '10mg once daily',
      },
    }),
    prisma.medicine.upsert({
      where: { id: 'med-12' },
      update: {},
      create: {
        id: 'med-12',
        name: 'Insulin Glargine',
        category: 'Diabetes',
        manufacturer: 'Diabetes Solutions',
        batchNumber: 'INS2024001',
        expiryDate: new Date('2025-05-31'),
        quantity: 100,
        unitPrice: 25.00,
        minimumStock: 10,
        description: 'Long-acting insulin for diabetes management',
        sideEffects: 'Hypoglycemia, injection site reactions',
        dosageInfo: 'As prescribed, usually once daily at bedtime',
      },
    }),
  ]);

  // Create demo bills
  console.log('💰 Creating demo bills...');

  const bill = await prisma.bill.upsert({
    where: { invoiceNumber: 'INV-2024-0922-001' },
    update: {},
    create: {
      invoiceNumber: 'INV-2024-0922-001',
      patientId: patients[0].id,
      totalAmount: 200.00,
      taxAmount: 20.00,
      paidAmount: 0.00,
      paymentStatus: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: 'Consultation fee',
      billItems: {
        create: [
          {
            description: 'Consultation - Cardiology',
            quantity: 1,
            unitPrice: 150.00,
            totalPrice: 150.00,
          },
          {
            description: 'ECG Test',
            quantity: 1,
            unitPrice: 50.00,
            totalPrice: 50.00,
          },
        ],
      },
    },
  });

  // Create demo lab tests
  console.log('🔬 Creating demo lab tests...');

  const labTests = await Promise.all([
    prisma.labTest.create({
      data: {
        testNumber: 'LAB-2024-001',
        patientId: patients[0].id,
        doctorId: doctorProfiles[0].id,
        testType: 'BLOOD_TEST',
        urgency: 'routine',
        status: 'requested',
        sampleInfo: 'Fasting blood sample required',
        cost: 50.00,
        notes: 'Check cholesterol levels',
      },
    }),
    prisma.labTest.create({
      data: {
        testNumber: 'LAB-2024-002',
        patientId: patients[1].id,
        doctorId: doctorProfiles[1].id,
        testType: 'X_RAY',
        urgency: 'urgent',
        status: 'sample_collected',
        sampleInfo: 'Chest X-ray',
        cost: 80.00,
        collectedAt: new Date(),
        notes: 'Check for pneumonia',
      },
    }),
  ]);

  // Create lab parameters
  console.log('🧪 Creating lab parameters...');

  const labParameters = await Promise.all([
    prisma.labParameter.create({
      data: {
        code: 'CHOL',
        name: 'Total Cholesterol',
        description: 'Total cholesterol measurement',
        unit: 'mg/dL',
        normalRangeMin: 125,
        normalRangeMax: 200,
        criticalMin: 50,
        criticalMax: 400,
        category: 'Lipid Profile',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'HDL',
        name: 'HDL Cholesterol',
        description: 'High-density lipoprotein cholesterol',
        unit: 'mg/dL',
        normalRangeMin: 40,
        normalRangeMax: 60,
        criticalMin: 15,
        criticalMax: 100,
        category: 'Lipid Profile',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'LDL',
        name: 'LDL Cholesterol',
        description: 'Low-density lipoprotein cholesterol',
        unit: 'mg/dL',
        normalRangeMin: 70,
        normalRangeMax: 100,
        criticalMin: 30,
        criticalMax: 300,
        category: 'Lipid Profile',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'GLUC',
        name: 'Glucose',
        description: 'Blood glucose level',
        unit: 'mg/dL',
        normalRangeMin: 70,
        normalRangeMax: 100,
        criticalMin: 40,
        criticalMax: 500,
        category: 'Diabetes Panel',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'HBA1C',
        name: 'HbA1c',
        description: 'Glycated hemoglobin',
        unit: '%',
        normalRangeMin: 4.0,
        normalRangeMax: 5.6,
        criticalMin: 2.0,
        criticalMax: 15.0,
        category: 'Diabetes Panel',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'WBC',
        name: 'White Blood Cells',
        description: 'White blood cell count',
        unit: '/µL',
        normalRangeMin: 4000,
        normalRangeMax: 11000,
        criticalMin: 1000,
        criticalMax: 50000,
        category: 'Complete Blood Count',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'RBC',
        name: 'Red Blood Cells',
        description: 'Red blood cell count',
        unit: 'million/µL',
        normalRangeMin: 4.2,
        normalRangeMax: 5.4,
        criticalMin: 2.0,
        criticalMax: 8.0,
        category: 'Complete Blood Count',
      },
    }),
    prisma.labParameter.create({
      data: {
        code: 'HGB',
        name: 'Hemoglobin',
        description: 'Hemoglobin concentration',
        unit: 'g/dL',
        normalRangeMin: 12.0,
        normalRangeMax: 16.0,
        criticalMin: 6.0,
        criticalMax: 20.0,
        category: 'Complete Blood Count',
      },
    }),
  ]);

  // Create lab panels
  console.log('📋 Creating lab panels...');

  const labPanels = await Promise.all([
    prisma.labPanel.create({
      data: {
        name: 'Lipid Profile',
        description: 'Comprehensive lipid analysis',
        category: 'Cardiology',
        cost: 85.00,
        turnaroundTime: 24,
        instructions: 'Patient must fast for 12 hours before test',
      },
    }),
    prisma.labPanel.create({
      data: {
        name: 'Diabetes Panel',
        description: 'Blood glucose and HbA1c testing',
        category: 'Endocrinology',
        cost: 65.00,
        turnaroundTime: 24,
        instructions: 'Fasting glucose requires 8-12 hours fasting',
      },
    }),
    prisma.labPanel.create({
      data: {
        name: 'Complete Blood Count',
        description: 'Full blood cell analysis',
        category: 'Hematology',
        cost: 45.00,
        turnaroundTime: 4,
        instructions: 'No special preparation required',
      },
    }),
  ]);

  // Create lab panel test associations
  console.log('🔗 Creating lab panel associations...');

  await Promise.all([
    // Lipid Profile panel
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[0].id,
        parameterId: labParameters[0].id, // CHOL
        displayOrder: 1,
      },
    }),
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[0].id,
        parameterId: labParameters[1].id, // HDL
        displayOrder: 2,
      },
    }),
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[0].id,
        parameterId: labParameters[2].id, // LDL
        displayOrder: 3,
      },
    }),
    // Diabetes Panel
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[1].id,
        parameterId: labParameters[3].id, // GLUC
        displayOrder: 1,
      },
    }),
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[1].id,
        parameterId: labParameters[4].id, // HBA1C
        displayOrder: 2,
      },
    }),
    // Complete Blood Count
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[2].id,
        parameterId: labParameters[5].id, // WBC
        displayOrder: 1,
      },
    }),
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[2].id,
        parameterId: labParameters[6].id, // RBC
        displayOrder: 2,
      },
    }),
    prisma.labPanelTest.create({
      data: {
        panelId: labPanels[2].id,
        parameterId: labParameters[7].id, // HGB
        displayOrder: 3,
      },
    }),
  ]);

  // Create sample lab results
  console.log('📊 Creating sample lab results...');

  const labResults = await Promise.all([
    // Results for first lab test (cholesterol)
    prisma.labResult.create({
      data: {
        labTestId: labTests[0].id,
        parameterId: labParameters[0].id, // CHOL
        value: '245',
        numericValue: 245,
        unit: 'mg/dL',
        referenceRange: '125-200 mg/dL',
        status: 'abnormal',
        interpretation: 'high',
        flags: 'H',
        isAbnormal: true,
        isCritical: false,
        verifiedBy: 'Lab Technician A',
        verifiedAt: new Date(),
      },
    }),
    prisma.labResult.create({
      data: {
        labTestId: labTests[0].id,
        parameterId: labParameters[1].id, // HDL
        value: '35',
        numericValue: 35,
        unit: 'mg/dL',
        referenceRange: '40-60 mg/dL',
        status: 'abnormal',
        interpretation: 'low',
        flags: 'L',
        isAbnormal: true,
        isCritical: false,
        verifiedBy: 'Lab Technician A',
        verifiedAt: new Date(),
      },
    }),
    prisma.labResult.create({
      data: {
        labTestId: labTests[0].id,
        parameterId: labParameters[2].id, // LDL
        value: '175',
        numericValue: 175,
        unit: 'mg/dL',
        referenceRange: '70-100 mg/dL',
        status: 'abnormal',
        interpretation: 'high',
        flags: 'H',
        isAbnormal: true,
        isCritical: false,
        verifiedBy: 'Lab Technician A',
        verifiedAt: new Date(),
      },
    }),
  ]);

  // Update lab test status to completed
  await prisma.labTest.update({
    where: { id: labTests[0].id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      results: 'Lipid profile shows elevated cholesterol and LDL, low HDL. Recommend dietary changes and statin therapy.',
    },
  });

  // Create sample admissions
  const admission1 = await prisma.admission.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctorProfiles[0].id,
      ward: 'General',
      roomNumber: 'G-101',
      bedNumber: 'B-1',
      admissionDate: new Date('2024-12-20'),
      admissionType: 'emergency',
      reason: 'Severe abdominal pain and fever. Suspected appendicitis requiring immediate medical attention.',
      status: 'admitted',
      notes: 'Patient admitted through emergency department. Vitals stable. Scheduled for appendectomy.',
    },
  });

  const admission2 = await prisma.admission.create({
    data: {
      patientId: patients[1].id,
      doctorId: doctorProfiles[1].id,
      ward: 'ICU',
      roomNumber: 'ICU-3',
      bedNumber: 'B-1',
      admissionDate: new Date('2024-12-18'),
      dischargeDate: new Date('2024-12-22'),
      admissionType: 'planned',
      reason: 'Cardiac catheterization and angioplasty procedure. Pre-operative preparation required.',
      status: 'discharged',
      notes: 'Planned admission for cardiac intervention. Patient responded well to treatment.',
      dischargeSummary: 'Successful cardiac catheterization with angioplasty. Two stents placed in LAD. Patient stable at discharge. Follow-up in cardiology clinic in 2 weeks. Continue dual antiplatelet therapy as prescribed.',
    },
  });

  const admission3 = await prisma.admission.create({
    data: {
      patientId: patients[2].id,
      doctorId: doctorProfiles[2].id,
      ward: 'Maternity',
      roomNumber: 'M-205',
      bedNumber: 'B-2',
      admissionDate: new Date('2024-12-25'),
      admissionType: 'planned',
      reason: 'Scheduled cesarean section delivery at 38 weeks gestation.',
      status: 'admitted',
      notes: 'Planned C-section admission. Pre-operative labs completed. Patient and baby monitoring ongoing.',
    },
  });

  // Create sample vital signs
  console.log('📊 Creating sample vital signs...');

  // Vital signs for patient 1 (John Doe)
  await prisma.vitalSign.create({
    data: {
      patientId: patients[0].id,
      type: 'BLOOD_PRESSURE',
      value: '140/90',
      unit: 'mmHg',
      normalRange: '90-140 / 60-90 mmHg',
      isAbnormal: true,
      notes: 'Slightly elevated blood pressure, monitor closely',
      measuredBy: 'Nurse Sarah',
      measuredAt: new Date('2024-12-20T08:30:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[0].id,
      type: 'HEART_RATE',
      value: '85',
      unit: 'bpm',
      normalRange: '60-100 bpm',
      isAbnormal: false,
      notes: 'Regular rhythm',
      measuredBy: 'Nurse Sarah',
      measuredAt: new Date('2024-12-20T08:30:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[0].id,
      type: 'TEMPERATURE',
      value: '38.2',
      unit: '°C',
      normalRange: '36.0-37.5°C',
      isAbnormal: true,
      notes: 'Fever present, started on antipyretics',
      measuredBy: 'Nurse Sarah',
      measuredAt: new Date('2024-12-20T08:30:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[0].id,
      type: 'OXYGEN_SATURATION',
      value: '96',
      unit: '%',
      normalRange: '95-100%',
      isAbnormal: false,
      notes: 'Normal oxygen saturation on room air',
      measuredBy: 'Nurse Sarah',
      measuredAt: new Date('2024-12-20T08:30:00'),
    },
  });

  // Vital signs for patient 2 (Jane Smith)
  await prisma.vitalSign.create({
    data: {
      patientId: patients[1].id,
      type: 'BLOOD_PRESSURE',
      value: '120/80',
      unit: 'mmHg',
      normalRange: '90-140 / 60-90 mmHg',
      isAbnormal: false,
      notes: 'Optimal blood pressure',
      measuredBy: 'Dr. Ali',
      measuredAt: new Date('2024-12-22T10:15:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[1].id,
      type: 'HEART_RATE',
      value: '72',
      unit: 'bpm',
      normalRange: '60-100 bpm',
      isAbnormal: false,
      notes: 'Post-procedure monitoring - stable rhythm',
      measuredBy: 'Dr. Ali',
      measuredAt: new Date('2024-12-22T10:15:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[1].id,
      type: 'PAIN_SCALE',
      value: '3',
      unit: '/10',
      normalRange: '0-3 (mild)',
      isAbnormal: false,
      notes: 'Mild discomfort at catheter site',
      measuredBy: 'Dr. Ali',
      measuredAt: new Date('2024-12-22T10:15:00'),
    },
  });

  // Vital signs for patient 3 (Sarah Johnson)
  await prisma.vitalSign.create({
    data: {
      patientId: patients[2].id,
      type: 'BLOOD_PRESSURE',
      value: '110/70',
      unit: 'mmHg',
      normalRange: '90-140 / 60-90 mmHg',
      isAbnormal: false,
      notes: 'Normal for pregnancy stage',
      measuredBy: 'Midwife Emma',
      measuredAt: new Date('2024-12-25T14:20:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[2].id,
      type: 'HEART_RATE',
      value: '88',
      unit: 'bpm',
      normalRange: '60-100 bpm',
      isAbnormal: false,
      notes: 'Normal maternal heart rate',
      measuredBy: 'Midwife Emma',
      measuredAt: new Date('2024-12-25T14:20:00'),
    },
  });

  await prisma.vitalSign.create({
    data: {
      patientId: patients[2].id,
      type: 'WEIGHT',
      value: '78',
      unit: 'kg',
      normalRange: 'Variable',
      isAbnormal: false,
      notes: 'Appropriate weight gain for gestational age',
      measuredBy: 'Midwife Emma',
      measuredAt: new Date('2024-12-25T14:20:00'),
    },
  });

  // Create sample medical documents
  console.log('📄 Creating sample medical documents...');

  await prisma.medicalDocument.create({
    data: {
      patientId: patients[0].id,
      type: 'PRESCRIPTION',
      title: 'Prescription for Blood Pressure Medication',
      description: 'Prescription for Lisinopril 10mg daily for hypertension management',
      filePath: '/uploads/medical-documents/prescription-bp-001.pdf',
      fileName: 'prescription-bp-medication.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf',
      uploadedBy: 'dr.mohammed.ali@medicore.com',
      isActive: true,
    },
  });

  await prisma.medicalDocument.create({
    data: {
      patientId: patients[0].id,
      type: 'LAB_REPORT',
      title: 'Blood Test Results - Lipid Panel',
      description: 'Complete lipid panel showing cholesterol levels within normal range',
      filePath: '/uploads/medical-documents/lab-lipid-panel-001.pdf',
      fileName: 'lipid-panel-results.pdf',
      fileSize: 189430,
      mimeType: 'application/pdf',
      uploadedBy: 'dr.mohammed.ali@medicore.com',
      isActive: true,
    },
  });

  await prisma.medicalDocument.create({
    data: {
      patientId: patients[1].id,
      type: 'RADIOLOGY_REPORT',
      title: 'Chest X-Ray Report',
      description: 'Chest X-ray showing clear lungs, no signs of pneumonia or other abnormalities',
      filePath: '/uploads/medical-documents/chest-xray-002.pdf',
      fileName: 'chest-xray-report.pdf',
      fileSize: 567890,
      mimeType: 'application/pdf',
      uploadedBy: 'dr.mohammed.ali@medicore.com',
      isActive: true,
    },
  });

  await prisma.medicalDocument.create({
    data: {
      patientId: patients[1].id,
      type: 'INSURANCE_DOCUMENT',
      title: 'Insurance Coverage Verification',
      description: 'Updated insurance card and coverage details for treatment authorization',
      filePath: '/uploads/medical-documents/insurance-card-002.jpg',
      fileName: 'insurance-card.jpg',
      fileSize: 234567,
      mimeType: 'image/jpeg',
      uploadedBy: 'abeer.babiker@medicore.com',
      isActive: true,
    },
  });

  await prisma.medicalDocument.create({
    data: {
      patientId: patients[2].id,
      type: 'CONSENT_FORM',
      title: 'Surgical Consent Form',
      description: 'Signed consent form for upcoming appendectomy procedure',
      filePath: '/uploads/medical-documents/surgical-consent-003.pdf',
      fileName: 'surgical-consent-form.pdf',
      fileSize: 198765,
      mimeType: 'application/pdf',
      uploadedBy: 'dr.hiba.yassir@medicore.com',
      isActive: true,
    },
  });

  await prisma.medicalDocument.create({
    data: {
      patientId: patients[2].id,
      type: 'MEDICAL_CERTIFICATE',
      title: 'Medical Certificate for Work Leave',
      description: 'Medical certificate recommending 2 weeks of bed rest post surgery',
      filePath: '/uploads/medical-documents/medical-cert-003.pdf',
      fileName: 'medical-certificate.pdf',
      fileSize: 156789,
      mimeType: 'application/pdf',
      uploadedBy: 'dr.mohammed.ali@medicore.com',
      isActive: true,
    },
  });

  // Create sample medical reports
  console.log('📊 Creating sample medical reports...');

  await prisma.medicalReport.create({
    data: {
      title: 'Patient Summary Report - John Doe',
      description: 'Comprehensive patient medical summary including recent admissions and test results',
      type: 'PATIENT_SUMMARY',
      format: 'PDF',
      status: 'COMPLETED',
      filePath: '/uploads/reports/patient-summary-001.pdf',
      fileSize: 245760,
      requestedBy: admin.id,
      filters: {
        patientId: patients[0].id,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.medicalReport.create({
    data: {
      title: 'Monthly Prescription Report',
      description: 'Analysis of prescriptions issued in the current month',
      type: 'PRESCRIPTION_REPORT',
      format: 'EXCEL',
      status: 'COMPLETED',
      filePath: '/uploads/reports/prescription-monthly-001.xlsx',
      fileSize: 98304,
      requestedBy: doctor.id,
      filters: {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        doctorId: doctorProfiles[0].id,
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.medicalReport.create({
    data: {
      title: 'Vital Signs Analysis Report',
      description: 'Trends and patterns in patient vital signs over the past quarter',
      type: 'VITAL_SIGNS_REPORT',
      format: 'PDF',
      status: 'PENDING',
      requestedBy: nurse.id,
      filters: {
        startDate: '2024-10-01',
        endDate: '2024-12-31',
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.medicalReport.create({
    data: {
      title: 'Admission Statistics Report',
      description: 'Hospital admission trends and capacity analysis',
      type: 'ADMISSION_REPORT',
      format: 'CSV',
      status: 'FAILED',
      requestedBy: admin.id,
      filters: {
        startDate: '2024-11-01',
        endDate: '2024-12-31',
        departmentId: 'emergency',
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create sample report templates
  await prisma.reportTemplate.create({
    data: {
      name: 'Standard Patient Summary',
      description: 'Comprehensive patient overview template including demographics, medical history, and recent activities',
      type: 'PATIENT_SUMMARY',
      templateConfig: {
        sections: ['demographics', 'medical_history', 'current_medications', 'recent_appointments', 'lab_results'],
        formatting: {
          pageSize: 'A4',
          orientation: 'portrait',
          includeLogo: true,
          includeSignature: true,
        },
      },
      isActive: true,
      createdBy: admin.id,
    },
  });

  await prisma.reportTemplate.create({
    data: {
      name: 'Monthly Prescription Analysis',
      description: 'Template for analyzing prescription patterns and drug utilization',
      type: 'PRESCRIPTION_REPORT',
      templateConfig: {
        sections: ['prescription_summary', 'drug_categories', 'prescriber_analysis', 'patient_adherence'],
        groupBy: ['doctor', 'medication_type', 'department'],
        chartTypes: ['bar', 'pie', 'trend'],
      },
      isActive: true,
      createdBy: doctor.id,
    },
  });

  // Create permissions and roles
  console.log('🔐 Creating permissions and roles...');

  const { ResourceType, PermissionAction } = await import('@prisma/client');

  // Define all permissions based on resources
  const permissionsData = [
    // Patient permissions
    { name: 'Create Patient', resource: ResourceType.PATIENT, action: PermissionAction.CREATE },
    { name: 'View Patient', resource: ResourceType.PATIENT, action: PermissionAction.READ },
    { name: 'Update Patient', resource: ResourceType.PATIENT, action: PermissionAction.UPDATE },
    { name: 'Delete Patient', resource: ResourceType.PATIENT, action: PermissionAction.DELETE },

    // Doctor permissions
    { name: 'Create Doctor', resource: ResourceType.DOCTOR, action: PermissionAction.CREATE },
    { name: 'View Doctor', resource: ResourceType.DOCTOR, action: PermissionAction.READ },
    { name: 'Update Doctor', resource: ResourceType.DOCTOR, action: PermissionAction.UPDATE },
    { name: 'Delete Doctor', resource: ResourceType.DOCTOR, action: PermissionAction.DELETE },

    // Appointment permissions
    { name: 'Create Appointment', resource: ResourceType.APPOINTMENT, action: PermissionAction.CREATE },
    { name: 'View Appointment', resource: ResourceType.APPOINTMENT, action: PermissionAction.READ },
    { name: 'Update Appointment', resource: ResourceType.APPOINTMENT, action: PermissionAction.UPDATE },
    { name: 'Delete Appointment', resource: ResourceType.APPOINTMENT, action: PermissionAction.DELETE },

    // Medical Record permissions
    { name: 'Create Medical Record', resource: ResourceType.MEDICAL_RECORD, action: PermissionAction.CREATE },
    { name: 'View Medical Record', resource: ResourceType.MEDICAL_RECORD, action: PermissionAction.READ },
    { name: 'Update Medical Record', resource: ResourceType.MEDICAL_RECORD, action: PermissionAction.UPDATE },
    { name: 'Delete Medical Record', resource: ResourceType.MEDICAL_RECORD, action: PermissionAction.DELETE },

    // Medical Record also includes diagnoses
    // { name: 'Create Diagnosis', resource: ResourceType.DIAGNOSIS, action: PermissionAction.CREATE },
    // { name: 'View Diagnosis', resource: ResourceType.DIAGNOSIS, action: PermissionAction.READ },
    // { name: 'Update Diagnosis', resource: ResourceType.DIAGNOSIS, action: PermissionAction.UPDATE },
    // { name: 'Delete Diagnosis', resource: ResourceType.DIAGNOSIS, action: PermissionAction.DELETE },

    // Prescription permissions
    { name: 'Create Prescription', resource: ResourceType.PRESCRIPTION, action: PermissionAction.CREATE },
    { name: 'View Prescription', resource: ResourceType.PRESCRIPTION, action: PermissionAction.READ },
    { name: 'Update Prescription', resource: ResourceType.PRESCRIPTION, action: PermissionAction.UPDATE },
    { name: 'Delete Prescription', resource: ResourceType.PRESCRIPTION, action: PermissionAction.DELETE },

    // Laboratory permissions (uses LAB_TEST in schema)
    { name: 'Create Lab Test', resource: ResourceType.LAB_TEST, action: PermissionAction.CREATE },
    { name: 'View Lab Test', resource: ResourceType.LAB_TEST, action: PermissionAction.READ },
    { name: 'Update Lab Test', resource: ResourceType.LAB_TEST, action: PermissionAction.UPDATE },
    { name: 'Delete Lab Test', resource: ResourceType.LAB_TEST, action: PermissionAction.DELETE },

    // Pharmacy permissions
    { name: 'Create Pharmacy Record', resource: ResourceType.PHARMACY, action: PermissionAction.CREATE },
    { name: 'View Pharmacy Record', resource: ResourceType.PHARMACY, action: PermissionAction.READ },
    { name: 'Update Pharmacy Record', resource: ResourceType.PHARMACY, action: PermissionAction.UPDATE },
    { name: 'Delete Pharmacy Record', resource: ResourceType.PHARMACY, action: PermissionAction.DELETE },

    // Admission permissions
    { name: 'Create Admission', resource: ResourceType.ADMISSION, action: PermissionAction.CREATE },
    { name: 'View Admission', resource: ResourceType.ADMISSION, action: PermissionAction.READ },
    { name: 'Update Admission', resource: ResourceType.ADMISSION, action: PermissionAction.UPDATE },
    { name: 'Delete Admission', resource: ResourceType.ADMISSION, action: PermissionAction.DELETE },

    // Billing permissions
    { name: 'Create Billing', resource: ResourceType.BILLING, action: PermissionAction.CREATE },
    { name: 'View Billing', resource: ResourceType.BILLING, action: PermissionAction.READ },
    { name: 'Update Billing', resource: ResourceType.BILLING, action: PermissionAction.UPDATE },
    { name: 'Delete Billing', resource: ResourceType.BILLING, action: PermissionAction.DELETE },

    // Report permissions (uses REPORTS in schema)
    { name: 'Generate Report', resource: ResourceType.REPORTS, action: PermissionAction.EXECUTE },
    { name: 'View Report', resource: ResourceType.REPORTS, action: PermissionAction.READ },

    // Settings permissions
    { name: 'View Settings', resource: ResourceType.SETTINGS, action: PermissionAction.READ },
    { name: 'Update Settings', resource: ResourceType.SETTINGS, action: PermissionAction.UPDATE },

    // User permissions
    { name: 'Create User', resource: ResourceType.USER, action: PermissionAction.CREATE },
    { name: 'View User', resource: ResourceType.USER, action: PermissionAction.READ },
    { name: 'Update User', resource: ResourceType.USER, action: PermissionAction.UPDATE },
    { name: 'Delete User', resource: ResourceType.USER, action: PermissionAction.DELETE },
  ];

  // Create permissions
  const permissions = await Promise.all(
    permissionsData.map(async (perm) => {
      return await prisma.permission.upsert({
        where: {
          resource_action: {
            resource: perm.resource,
            action: perm.action,
          },
        },
        update: {},
        create: perm,
      });
    })
  );
  console.log(`✅ Created ${permissions.length} permissions`);

  // Helper function to get permission IDs
  const getPermissionIds = (resources: any[], actions?: any[]) => {
    return permissions
      .filter((p) => {
        const resourceMatch = resources.includes(p.resource);
        const actionMatch = actions ? actions.includes(p.action) : true;
        return resourceMatch && actionMatch;
      })
      .map((p) => p.id);
  };

  // Define roles with their permissions
  const rolesData = [
    {
      name: 'Admin',
      description: 'Full system access',
      isSystem: true,
      permissionIds: permissions.map((p) => p.id), // All permissions
    },
    {
      name: 'Doctor',
      description: 'Doctor access to medical records and patient care',
      isSystem: true,
      permissionIds: getPermissionIds([
        ResourceType.PATIENT,
        ResourceType.APPOINTMENT,
        ResourceType.MEDICAL_RECORD,
        ResourceType.PRESCRIPTION,
        ResourceType.LAB_TEST,
        ResourceType.PHARMACY,
        ResourceType.ADMISSION,
        ResourceType.REPORTS,
      ]).concat(
        getPermissionIds([ResourceType.DOCTOR], [PermissionAction.READ])
      ),
    },
    {
      name: 'Nurse',
      description: 'Nurse access to patient care and medical records',
      isSystem: true,
      permissionIds: getPermissionIds([
        ResourceType.PATIENT,
        ResourceType.APPOINTMENT,
        ResourceType.MEDICAL_RECORD,
        ResourceType.PRESCRIPTION,
        ResourceType.LAB_TEST,
        ResourceType.PHARMACY,
        ResourceType.ADMISSION,
      ], [PermissionAction.READ, PermissionAction.UPDATE]).concat(
        getPermissionIds([ResourceType.DOCTOR], [PermissionAction.READ])
      ),
    },
    {
      name: 'Receptionist',
      description: 'Receptionist access to appointments and billing',
      isSystem: true,
      permissionIds: getPermissionIds([
        ResourceType.PATIENT,
        ResourceType.APPOINTMENT,
        ResourceType.BILLING,
      ]).concat(
        getPermissionIds([ResourceType.DOCTOR], [PermissionAction.READ])
      ),
    },
  ];

  // Create roles with permissions
  for (const roleData of rolesData) {
    const { permissionIds, ...roleInfo } = roleData;

    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleInfo,
    });

    // Assign permissions to role
    await Promise.all(
      permissionIds.map(async (permissionId) => {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId,
          },
        });
      })
    );

    console.log(`✅ Created role: ${role.name} with ${permissionIds.length} permissions`);
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`  - 4 Users (Admin, Doctor, Nurse, Receptionist)`);
  console.log(`  - 3 Doctors`);
  console.log(`  - 3 Patients`);
  console.log(`  - 8 Lab Parameters`);
  console.log(`  - 3 Lab Panels`);
  console.log(`  - 8 Panel Test Associations`);
  console.log(`  - 2 Appointments`);
  console.log(`  - 12 Medicines`);
  console.log(`  - 1 Bill with 2 items`);
  console.log(`  - 2 Lab Tests`);
  console.log(`  - 3 Admissions`);
  console.log(`  - 10 Vital Signs`);
  console.log(`  - 6 Medical Documents`);
  console.log(`  - 4 Medical Reports`);
  console.log(`  - 2 Report Templates`);
  console.log(`  - ${permissions.length} Permissions`);
  console.log(`  - 4 Roles (Admin, Doctor, Nurse, Receptionist)`);
  console.log('🔐 Demo login credentials:');
  console.log('  - Admin: admin@medicore.com / password123');
  console.log('  - Doctor: dr.mohammed.ali@medicore.com / password123');
  console.log('  - Nurse: dr.hiba.yassir@medicore.com / password123');
  console.log('  - Receptionist: abeer.babiker@medicore.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });