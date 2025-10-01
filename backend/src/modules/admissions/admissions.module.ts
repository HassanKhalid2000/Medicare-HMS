import { Module } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { DatabaseModule } from '../../config/database.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}