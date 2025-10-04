import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './config/database.module';
import { RedisModule } from './config/redis.module';
import { SecurityModule } from './common/security/security.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { DiagnosesModule } from './modules/diagnoses/diagnoses.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { MedicalReportsModule } from './modules/medical-reports/medical-reports.module';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PermissionsModule } from './modules/permissions/permissions.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database and Cache
    DatabaseModule,
    RedisModule,

    // Security (includes rate limiting and throttling)
    SecurityModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    BillingModule,
    DashboardModule,
    MedicalRecordsModule,
    DiagnosesModule,
    PrescriptionsModule,
    LaboratoryModule,
    PharmacyModule,
    AdmissionsModule,
    MedicalReportsModule,
    SettingsModule,
    PermissionsModule,
  ],
})
export class AppModule {}
