const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleLabTests() {
  try {
    // Get first patient and doctor
    const patient = await prisma.patient.findFirst();
    const doctor = await prisma.doctor.findFirst();

    if (!patient || !doctor) {
      console.error('No patient or doctor found in database');
      process.exit(1);
    }

    console.log(`Creating lab tests for patient: ${patient.firstName} ${patient.lastName}`);
    console.log(`Ordered by doctor: ${doctor.name}`);

    // Create sample lab tests
    const labTests = [
      {
        patientId: patient.id,
        doctorId: doctor.id,
        testType: 'BLOOD_TEST',
        urgency: 'routine',
        status: 'completed',
        sampleInfo: 'Blood sample collected from left arm',
        notes: 'Complete blood count test',
        cost: 50.00
      },
      {
        patientId: patient.id,
        doctorId: doctor.id,
        testType: 'URINE_TEST',
        urgency: 'routine',
        status: 'processing',
        sampleInfo: 'Urine sample collected',
        notes: 'Urinalysis test',
        cost: 30.00
      },
      {
        patientId: patient.id,
        doctorId: doctor.id,
        testType: 'X_RAY',
        urgency: 'urgent',
        status: 'sample_collected',
        notes: 'Chest X-ray',
        cost: 100.00
      },
      {
        patientId: patient.id,
        doctorId: doctor.id,
        testType: 'ECG',
        urgency: 'stat',
        status: 'requested',
        notes: 'Electrocardiogram',
        cost: 75.00
      },
      {
        patientId: patient.id,
        doctorId: doctor.id,
        testType: 'CT_SCAN',
        urgency: 'urgent',
        status: 'completed',
        notes: 'CT scan of abdomen',
        cost: 500.00,
        completedAt: new Date()
      }
    ];

    // Generate test numbers and create tests
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `LAB-${year}${month}`;

    for (let i = 0; i < labTests.length; i++) {
      const testNumber = `${prefix}-${String(i + 1).padStart(4, '0')}`;
      const testData = {
        ...labTests[i],
        testNumber,
        cost: labTests[i].cost
      };

      const created = await prisma.labTest.create({
        data: testData,
        include: {
          patient: true,
          doctor: true
        }
      });

      console.log(`✓ Created lab test: ${created.testNumber} - ${created.testType}`);
    }

    console.log('\nSuccessfully created 5 sample lab tests!');
  } catch (error) {
    console.error('Error creating sample lab tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleLabTests();
