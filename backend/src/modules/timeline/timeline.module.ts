import { Module } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { PrismaModule } from '../../config/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}