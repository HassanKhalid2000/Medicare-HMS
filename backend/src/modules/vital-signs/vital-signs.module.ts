import { Module } from '@nestjs/common';
import { VitalSignsService } from './vital-signs.service';
import { VitalSignsController } from './vital-signs.controller';
import { PrismaModule } from '../../config/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VitalSignsController],
  providers: [VitalSignsService],
  exports: [VitalSignsService],
})
export class VitalSignsModule {}