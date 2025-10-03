import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { PrismaService } from '../../config/database.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService, PrismaService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
