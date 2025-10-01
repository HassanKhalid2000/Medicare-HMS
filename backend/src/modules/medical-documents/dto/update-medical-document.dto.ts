import { PartialType } from '@nestjs/swagger';
import { CreateMedicalDocumentDto } from './create-medical-document.dto';

export class UpdateMedicalDocumentDto extends PartialType(CreateMedicalDocumentDto) {}