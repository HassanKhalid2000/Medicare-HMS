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
    where: { email: 'hassan.khalid@medicore.com' },
    update: {},
    create: {
      fullName: 'Hassan Khalid',
      email: 'hassan.khalid@medicore.com',
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '+1234567890',
      department: 'Administration',
      employeeId: 'ADM001',
      status: 'active',
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'dr.mohammed.ali@medicore.com' },
    update: {},
    create: {
      fullName: 'Dr. Mohammed Ali',
      email: 'dr.mohammed.ali@medicore.com',
      passwordHash: hashedPassword,
      role: 'doctor',
      phone: '+1234567891',
      department: 'Cardiology',
      employeeId: 'DOC001',
      status: 'active',
    },
  });

  const nurse = await prisma.user.upsert({
    where: { email: 'dr.hiba.yassir@medicore.com' },
    update: {},
    create: {
      fullName: 'Dr. Hiba Yassir',
      email: 'dr.hiba.yassir@medicore.com',
      passwordHash: hashedPassword,
      role: 'nurse',
      phone: '+1234567892',
      department: 'Emergency',
      employeeId: 'NUR001',
      status: 'active',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'abeer.babiker@medicore.com' },
    update: {},
    create: {
      fullName: 'Abeer Babiker',
      email: 'abeer.babiker@medicore.com',
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
      where: { email: 'dr.mohammed.ali@medicore.com' },
      update: {},
      create: {
        doctorId: 'DOC001',
        name: 'Dr. Mohammed Ali',
        specialization: 'CARDIOLOGY',
        phone: '+1234567891',
        email: 'dr.mohammed.ali@medicore.com',
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
  ]);

  // Create demo bills
  console.log('💰 Creating demo bills...');

  const bill = await prisma.bill.create({
    data: {
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

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`  - 4 Users (Admin, Doctor, Nurse, Receptionist)`);
  console.log(`  - 3 Doctors`);
  console.log(`  - 3 Patients`);
  console.log(`  - 2 Appointments`);
  console.log(`  - 2 Medicines`);
  console.log(`  - 1 Bill with 2 items`);
  console.log(`  - 2 Lab Tests`);
  console.log('🔐 Demo login credentials:');
  console.log('  - Admin: hassan.khalid@medicore.com / password123');
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