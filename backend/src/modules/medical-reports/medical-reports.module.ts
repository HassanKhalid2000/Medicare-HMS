import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MedicalReportsService } from './medical-reports.service';
import { MedicalReportsController } from './medical-reports.controller';
import { PrismaModule } from '../../config/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, JwtModule, AuthModule],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService],
  exports: [MedicalReportsService],
})
export class MedicalReportsModule {}