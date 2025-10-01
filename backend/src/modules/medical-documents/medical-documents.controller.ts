import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { MedicalDocumentsService } from './medical-documents.service';
import { CreateMedicalDocumentDto, UpdateMedicalDocumentDto } from './dto';
import { DocumentType } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Medical Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('medical-documents')
export class MedicalDocumentsController {
  constructor(private readonly medicalDocumentsService: MedicalDocumentsService) {}

  @Post()
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  @ApiOperation({ summary: 'Create a new medical document record' })
  @ApiResponse({ status: 201, description: 'Medical document created successfully' })
  @ApiResponse({ status: 404, description: 'Patient or medical record not found' })
  create(@Body() createMedicalDocumentDto: CreateMedicalDocumentDto) {
    return this.medicalDocumentsService.create(createMedicalDocumentDto);
  }

  @Post('upload')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a medical document file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or missing parameters' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId: string,
    @Body('type') type: DocumentType,
    @Body('title') title: string,
    @Body('description') description?: string,
    @Body('medicalRecordId') medicalRecordId?: string,
    @GetUser() user?: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!patientId || !type || !title) {
      throw new BadRequestException('Missing required fields: patientId, type, title');
    }

    const uploadedBy = user?.email || 'system';

    return this.medicalDocumentsService.uploadFile(
      file,
      patientId,
      type,
      title,
      uploadedBy,
      description,
      medicalRecordId,
    );
  }

  @Get()
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Get all medical documents with optional filters' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'type', required: false, enum: DocumentType, description: 'Filter by document type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  findAll(
    @Query('patientId') patientId?: string,
    @Query('type') type?: DocumentType,
    @Query('isActive') isActive?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (patientId) filters.patientId = patientId;
    if (type) filters.type = type;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (limit) filters.limit = parseInt(limit, 10);

    return this.medicalDocumentsService.findAll(filters);
  }

  @Get('search')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Search medical documents' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  searchDocuments(
    @Query('q') query: string,
    @Query('patientId') patientId?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }

    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.medicalDocumentsService.searchDocuments(query.trim(), patientId, limitNum);
  }

  @Get('search/patients')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Search patients for document association' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Patient search results retrieved successfully' })
  searchPatients(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }

    return this.medicalDocumentsService.searchPatients(query.trim());
  }

  @Get('statistics')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  @ApiOperation({ summary: 'Get document statistics' })
  @ApiQuery({ name: 'patientId', required: false, description: 'Filter by patient ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics(@Query('patientId') patientId?: string) {
    return this.medicalDocumentsService.getDocumentsStatistics(patientId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Get documents for a specific patient' })
  @ApiQuery({ name: 'type', required: false, enum: DocumentType, description: 'Filter by document type' })
  @ApiResponse({ status: 200, description: 'Patient documents retrieved successfully' })
  getPatientDocuments(
    @Param('patientId') patientId: string,
    @Query('type') type?: DocumentType,
  ) {
    return this.medicalDocumentsService.getPatientDocuments(patientId, type);
  }

  @Get(':id')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Get a medical document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  findOne(@Param('id') id: string) {
    return this.medicalDocumentsService.findOne(id);
  }

  @Get(':id/download')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin, UserRole.receptionist)
  @ApiOperation({ summary: 'Download a medical document file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Document or file not found' })
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.medicalDocumentsService.downloadFile(id);
      throw new NotFoundException('File download not implemented yet');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to download file');
    }
  }

  @Patch(':id')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  @ApiOperation({ summary: 'Update a medical document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  update(@Param('id') id: string, @Body() updateMedicalDocumentDto: UpdateMedicalDocumentDto) {
    return this.medicalDocumentsService.update(id, updateMedicalDocumentDto);
  }

  @Delete(':id')
  @Roles(UserRole.doctor, UserRole.admin)
  @ApiOperation({ summary: 'Permanently delete a medical document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  remove(@Param('id') id: string) {
    return this.medicalDocumentsService.remove(id);
  }

  @Patch(':id/soft-delete')
  @Roles(UserRole.doctor, UserRole.nurse, UserRole.admin)
  @ApiOperation({ summary: 'Soft delete a medical document (mark as inactive)' })
  @ApiResponse({ status: 200, description: 'Document soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  softDelete(@Param('id') id: string) {
    return this.medicalDocumentsService.softDelete(id);
  }
}