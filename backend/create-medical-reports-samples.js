const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleReports() {
  try {
    console.log('Creating sample medical reports...');

    // Get the first user to use as requestedBy
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    const reports = [
      {
        title: 'Monthly Patient Summary - January 2025',
        description: 'Comprehensive summary of all patients admitted in January 2025',
        type: 'PATIENT_SUMMARY',
        format: 'PDF',
        status: 'COMPLETED',
        requestedBy: user.id,
        generatedBy: user.id,
        requestedAt: new Date('2025-01-31T10:00:00Z'),
        completedAt: new Date('2025-01-31T10:15:00Z'),
        fileName: 'patient_summary_jan2025.pdf',
        fileSize: 524288, // 512 KB
        filePath: '/reports/2025/01/patient_summary_jan2025.pdf',
        filters: JSON.stringify({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        })
      },
      {
        title: 'Lab Results Report - Q4 2024',
        description: 'Quarterly laboratory test results analysis',
        type: 'LAB_RESULTS_REPORT',
        format: 'EXCEL',
        status: 'COMPLETED',
        requestedBy: user.id,
        generatedBy: user.id,
        requestedAt: new Date('2024-12-31T15:30:00Z'),
        completedAt: new Date('2024-12-31T15:45:00Z'),
        fileName: 'lab_results_q4_2024.xlsx',
        fileSize: 1048576, // 1 MB
        filePath: '/reports/2024/12/lab_results_q4_2024.xlsx',
        filters: JSON.stringify({
          startDate: '2024-10-01',
          endDate: '2024-12-31'
        })
      },
      {
        title: 'Financial Report - December 2024',
        description: 'Monthly billing and payment analysis',
        type: 'FINANCIAL_REPORT',
        format: 'PDF',
        status: 'COMPLETED',
        requestedBy: user.id,
        generatedBy: user.id,
        requestedAt: new Date('2025-01-02T09:00:00Z'),
        completedAt: new Date('2025-01-02T09:20:00Z'),
        fileName: 'financial_report_dec2024.pdf',
        fileSize: 327680, // 320 KB
        filePath: '/reports/2025/01/financial_report_dec2024.pdf',
        filters: JSON.stringify({
          startDate: '2024-12-01',
          endDate: '2024-12-31'
        })
      },
      {
        title: 'Appointment Statistics Report',
        description: 'Weekly appointment scheduling and attendance analysis',
        type: 'APPOINTMENT_REPORT',
        format: 'CSV',
        status: 'COMPLETED',
        requestedBy: user.id,
        generatedBy: user.id,
        requestedAt: new Date('2025-02-01T08:00:00Z'),
        completedAt: new Date('2025-02-01T08:05:00Z'),
        fileName: 'appointment_stats_week5.csv',
        fileSize: 102400, // 100 KB
        filePath: '/reports/2025/02/appointment_stats_week5.csv',
        filters: JSON.stringify({
          startDate: '2025-01-27',
          endDate: '2025-02-02'
        })
      },
      {
        title: 'Admission Report - Emergency Cases',
        description: 'Analysis of emergency admissions for the past month',
        type: 'ADMISSION_REPORT',
        format: 'PDF',
        status: 'GENERATING',
        requestedBy: user.id,
        requestedAt: new Date('2025-02-03T11:00:00Z'),
        startedAt: new Date('2025-02-03T11:05:00Z'),
        filters: JSON.stringify({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          admissionType: 'emergency'
        })
      },
      {
        title: 'Prescription Analysis Report',
        description: 'Monthly prescription trends and medication usage',
        type: 'PRESCRIPTION_REPORT',
        format: 'PDF',
        status: 'PENDING',
        requestedBy: user.id,
        requestedAt: new Date('2025-02-03T14:00:00Z'),
        filters: JSON.stringify({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        })
      },
      {
        title: 'Diagnosis Trends Report',
        description: 'Quarterly diagnosis statistics and trends',
        type: 'DIAGNOSIS_REPORT',
        format: 'EXCEL',
        status: 'FAILED',
        requestedBy: user.id,
        requestedAt: new Date('2025-02-02T10:00:00Z'),
        startedAt: new Date('2025-02-02T10:05:00Z'),
        errorMessage: 'Insufficient data for the specified date range',
        retryCount: 2,
        filters: JSON.stringify({
          startDate: '2024-10-01',
          endDate: '2024-12-31'
        })
      },
      {
        title: 'Vital Signs Monitoring Report',
        description: 'Patient vital signs analysis for ICU patients',
        type: 'VITAL_SIGNS_REPORT',
        format: 'JSON',
        status: 'COMPLETED',
        requestedBy: user.id,
        generatedBy: user.id,
        requestedAt: new Date('2025-02-01T16:00:00Z'),
        completedAt: new Date('2025-02-01T16:10:00Z'),
        fileName: 'vital_signs_icu_jan2025.json',
        fileSize: 2097152, // 2 MB
        filePath: '/reports/2025/02/vital_signs_icu_jan2025.json',
        filters: JSON.stringify({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          ward: 'ICU'
        })
      }
    ];

    for (const report of reports) {
      const created = await prisma.medicalReport.create({
        data: report
      });
      console.log(`✓ Created report: ${created.title} (${created.status})`);
    }

    console.log(`\nSuccessfully created ${reports.length} sample medical reports!`);
  } catch (error) {
    console.error('Error creating sample reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleReports();
