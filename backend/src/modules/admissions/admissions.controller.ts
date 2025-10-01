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
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import { AdmissionQueryDto } from './dto/admission-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Create a new admission' })
  @ApiResponse({ status: 201, description: 'Admission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Patient or doctor not found' })
  create(@Body() createAdmissionDto: CreateAdmissionDto) {
    return this.admissionsService.create(createAdmissionDto);
  }

  @Get()
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get all admissions with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Admissions retrieved successfully' })
  findAll(@Query() query: AdmissionQueryDto) {
    return this.admissionsService.findAll(query);
  }

  @Get('statistics')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Get admission statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.admissionsService.getAdmissionStatistics();
  }

  @Get('ward-statistics')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Get ward statistics' })
  @ApiResponse({ status: 200, description: 'Ward statistics retrieved successfully' })
  getWardStatistics() {
    return this.admissionsService.getWardStatistics();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'nurse', 'receptionist')
  @ApiOperation({ summary: 'Get admission by ID' })
  @ApiResponse({ status: 200, description: 'Admission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Admission not found' })
  findOne(@Param('id') id: string) {
    return this.admissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Update admission' })
  @ApiResponse({ status: 200, description: 'Admission updated successfully' })
  @ApiResponse({ status: 404, description: 'Admission not found' })
  update(@Param('id') id: string, @Body() updateAdmissionDto: UpdateAdmissionDto) {
    return this.admissionsService.update(id, updateAdmissionDto);
  }

  @Put(':id/discharge')
  @Roles('admin', 'doctor', 'nurse')
  @ApiOperation({ summary: 'Discharge patient' })
  @ApiResponse({ status: 200, description: 'Patient discharged successfully' })
  @ApiResponse({ status: 400, description: 'Patient already discharged' })
  @ApiResponse({ status: 404, description: 'Admission not found' })
  discharge(
    @Param('id') id: string,
    @Body('dischargeSummary') dischargeSummary?: string,
  ) {
    return this.admissionsService.discharge(id, dischargeSummary);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete admission' })
  @ApiResponse({ status: 200, description: 'Admission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admission not found' })
  remove(@Param('id') id: string) {
    return this.admissionsService.remove(id);
  }
}