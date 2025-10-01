import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MedicalAlertsService } from './medical-alerts.service';
import { MedicalAlertsController } from './medical-alerts.controller';
import { PrismaModule } from '../../config/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [MedicalAlertsController],
  providers: [MedicalAlertsService],
  exports: [MedicalAlertsService],
})
export class MedicalAlertsModule {}