import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { TimelineQueryDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Patient Timeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('patient/:patientId')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  @ApiOperation({ summary: 'Get complete patient medical timeline' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient timeline retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientTimeline(
    @Param('patientId') patientId: string,
    @Query(ValidationPipe) query: TimelineQueryDto,
  ) {
    return this.timelineService.getPatientTimeline(patientId, query);
  }

  @Get('patient/:patientId/summary')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Get patient timeline summary with recent activity and alerts' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Timeline summary retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getTimelineSummary(@Param('patientId') patientId: string) {
    return this.timelineService.getTimelineSummary(patientId);
  }
}