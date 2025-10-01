import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MedicalAlertsService } from './medical-alerts.service';
import { CreateMedicalAlertDto, UpdateMedicalAlertDto, MedicalAlertQueryDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@ApiTags('Medical Alerts & Reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-alerts')
export class MedicalAlertsController {
  constructor(private readonly medicalAlertsService: MedicalAlertsService) {}

  @Post()
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Create a new medical alert',
    description: 'Create a medical alert or reminder for a patient',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Medical alert created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or patient not found',
  })
  create(@Body() createMedicalAlertDto: CreateMedicalAlertDto) {
    return this.medicalAlertsService.create(createMedicalAlertDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({
    summary: 'Get all medical alerts',
    description: 'Retrieve all medical alerts with optional filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical alerts retrieved successfully',
  })
  findAll(@Query() query: MedicalAlertQueryDto) {
    return this.medicalAlertsService.findAll(query);
  }

  @Get('critical')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Get critical alerts',
    description: 'Retrieve all unacknowledged critical alerts',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Critical alerts retrieved successfully',
  })
  getCriticalAlerts() {
    return this.medicalAlertsService.getCriticalAlerts();
  }

  @Get('statistics')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Get alert statistics',
    description: 'Retrieve comprehensive statistics about medical alerts',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Alert statistics retrieved successfully',
  })
  getStatistics() {
    return this.medicalAlertsService.getAlertStatistics();
  }

  @Get('patient/:patientId')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({
    summary: 'Get alerts for a specific patient',
    description: 'Retrieve all active alerts for a specific patient',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient ID',
    example: 'uuid-patient-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Patient alerts retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient not found',
  })
  getPatientAlerts(@Param('patientId') patientId: string) {
    return this.medicalAlertsService.getPatientAlerts(patientId);
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({
    summary: 'Get a specific medical alert',
    description: 'Retrieve details of a specific medical alert by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Medical alert ID',
    example: 'uuid-alert-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical alert retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical alert not found',
  })
  findOne(@Param('id') id: string) {
    return this.medicalAlertsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Update a medical alert',
    description: 'Update details of a specific medical alert',
  })
  @ApiParam({
    name: 'id',
    description: 'Medical alert ID',
    example: 'uuid-alert-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical alert updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical alert not found',
  })
  update(@Param('id') id: string, @Body() updateMedicalAlertDto: UpdateMedicalAlertDto) {
    return this.medicalAlertsService.update(id, updateMedicalAlertDto);
  }

  @Patch(':id/acknowledge')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Acknowledge a medical alert',
    description: 'Mark a medical alert as acknowledged by the current user',
  })
  @ApiParam({
    name: 'id',
    description: 'Medical alert ID',
    example: 'uuid-alert-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical alert acknowledged successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical alert not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Alert already acknowledged',
  })
  acknowledge(@Param('id') id: string, @GetUser() user: any) {
    return this.medicalAlertsService.acknowledge(id, user.email);
  }

  @Patch(':id/deactivate')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Deactivate a medical alert',
    description: 'Deactivate a medical alert (mark as inactive)',
  })
  @ApiParam({
    name: 'id',
    description: 'Medical alert ID',
    example: 'uuid-alert-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical alert deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical alert not found',
  })
  deactivate(@Param('id') id: string) {
    return this.medicalAlertsService.deactivate(id);
  }

  @Delete(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({
    summary: 'Delete a medical alert',
    description: 'Permanently delete a medical alert (admin/doctor only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Medical alert ID',
    example: 'uuid-alert-id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Medical alert deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Medical alert not found',
  })
  remove(@Param('id') id: string) {
    return this.medicalAlertsService.remove(id);
  }

  @Post('cleanup-expired')
  @Roles('admin')
  @ApiOperation({
    summary: 'Cleanup expired alerts',
    description: 'Deactivate all expired alerts (admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired alerts cleaned up successfully',
  })
  cleanupExpired() {
    return this.medicalAlertsService.cleanupExpiredAlerts();
  }

  @Post('medication-reminder')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Create medication reminder',
    description: 'Create a medication reminder alert for a patient',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Medication reminder created successfully',
  })
  createMedicationReminder(
    @Body() body: { patientId: string; medicationName: string; nextDoseTime: string }
  ) {
    return this.medicalAlertsService.createMedicationReminder(
      body.patientId,
      body.medicationName,
      new Date(body.nextDoseTime)
    );
  }

  @Post('critical-lab-alert')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Create critical lab alert',
    description: 'Create a critical lab result alert for a patient',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Critical lab alert created successfully',
  })
  createCriticalLabAlert(
    @Body() body: { patientId: string; labTest: string; value: string; normalRange: string }
  ) {
    return this.medicalAlertsService.createCriticalLabAlert(
      body.patientId,
      body.labTest,
      body.value,
      body.normalRange
    );
  }

  @Post('vital-signs-alert')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({
    summary: 'Create vital signs alert',
    description: 'Create an abnormal vital signs alert for a patient',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vital signs alert created successfully',
  })
  createVitalSignsAlert(
    @Body() body: { patientId: string; vitalSign: string; value: string; normalRange: string }
  ) {
    return this.medicalAlertsService.createVitalSignsAlert(
      body.patientId,
      body.vitalSign,
      body.value,
      body.normalRange
    );
  }

  @Post('appointment-reminder')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({
    summary: 'Create appointment reminder',
    description: 'Create an appointment reminder alert for a patient',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment reminder created successfully',
  })
  createAppointmentReminder(
    @Body() body: { patientId: string; appointmentDate: string; doctorName: string }
  ) {
    return this.medicalAlertsService.createAppointmentReminder(
      body.patientId,
      new Date(body.appointmentDate),
      body.doctorName
    );
  }
}