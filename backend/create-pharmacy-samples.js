const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleMedicines() {
  try {
    console.log('Creating sample medicines...');

    const medicines = [
      {
        name: 'Paracetamol 500mg',
        category: 'Analgesic',
        manufacturer: 'Pfizer Inc.',
        batchNumber: 'PARA-2024-001',
        expiryDate: new Date('2025-12-31'),
        quantity: 500,
        unitPrice: 0.50,
        minimumStock: 100,
        description: 'Pain reliever and fever reducer',
        dosageInfo: 'Adults: 1-2 tablets every 4-6 hours',
        sideEffects: 'Rare allergic reactions, liver damage with overdose'
      },
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotic',
        manufacturer: 'GlaxoSmithKline',
        batchNumber: 'AMOX-2024-002',
        expiryDate: new Date('2025-08-15'),
        quantity: 200,
        unitPrice: 2.50,
        minimumStock: 50,
        description: 'Penicillin antibiotic for bacterial infections',
        dosageInfo: 'Adults: 250-500mg every 8 hours',
        sideEffects: 'Nausea, diarrhea, rash'
      },
      {
        name: 'Ibuprofen 400mg',
        category: 'Analgesic',
        manufacturer: 'Johnson & Johnson',
        batchNumber: 'IBU-2024-003',
        expiryDate: new Date('2026-03-20'),
        quantity: 300,
        unitPrice: 1.20,
        minimumStock: 80,
        description: 'Anti-inflammatory pain reliever',
        dosageInfo: 'Adults: 200-400mg every 4-6 hours',
        sideEffects: 'Stomach upset, heartburn, dizziness'
      },
      {
        name: 'Metformin 500mg',
        category: 'Antidiabetic',
        manufacturer: 'Merck',
        batchNumber: 'MET-2024-004',
        expiryDate: new Date('2025-11-30'),
        quantity: 150,
        unitPrice: 0.75,
        minimumStock: 40,
        description: 'Type 2 diabetes medication',
        dosageInfo: 'Adults: 500mg twice daily with meals',
        sideEffects: 'Nausea, diarrhea, lactic acidosis (rare)'
      },
      {
        name: 'Omeprazole 20mg',
        category: 'Proton Pump Inhibitor',
        manufacturer: 'AstraZeneca',
        batchNumber: 'OME-2024-005',
        expiryDate: new Date('2025-09-15'),
        quantity: 180,
        unitPrice: 1.50,
        minimumStock: 50,
        description: 'Reduces stomach acid production',
        dosageInfo: 'Adults: 20mg once daily before breakfast',
        sideEffects: 'Headache, diarrhea, nausea'
      },
      {
        name: 'Lisinopril 10mg',
        category: 'ACE Inhibitor',
        manufacturer: 'Novartis',
        batchNumber: 'LIS-2024-006',
        expiryDate: new Date('2026-01-10'),
        quantity: 120,
        unitPrice: 0.80,
        minimumStock: 30,
        description: 'Blood pressure medication',
        dosageInfo: 'Adults: 10-40mg once daily',
        sideEffects: 'Dizziness, dry cough, fatigue'
      },
      {
        name: 'Atorvastatin 20mg',
        category: 'Statin',
        manufacturer: 'Pfizer Inc.',
        batchNumber: 'ATO-2024-007',
        expiryDate: new Date('2025-07-25'),
        quantity: 90,
        unitPrice: 1.80,
        minimumStock: 25,
        description: 'Cholesterol-lowering medication',
        dosageInfo: 'Adults: 10-80mg once daily',
        sideEffects: 'Muscle pain, liver problems, nausea'
      }
    ];

    for (const medicine of medicines) {
      const created = await prisma.medicine.create({
        data: medicine
      });
      console.log(`✓ Created medicine: ${created.name}`);
    }

    console.log(`\nSuccessfully created ${medicines.length} sample medicines!`);
  } catch (error) {
    console.error('Error creating sample medicines:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleMedicines();
