import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';
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
  controllers: [LaboratoryController],
  providers: [LaboratoryService, PrismaService],
  exports: [LaboratoryService],
})
export class LaboratoryModule {}
