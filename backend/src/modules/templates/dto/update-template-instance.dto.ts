import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateInstanceDto } from './create-template-instance.dto';

export class UpdateTemplateInstanceDto extends PartialType(CreateTemplateInstanceDto) {}