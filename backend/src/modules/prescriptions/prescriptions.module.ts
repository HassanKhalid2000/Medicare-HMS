import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { DatabaseModule } from '../../config/database.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}