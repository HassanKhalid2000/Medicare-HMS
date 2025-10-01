import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MedicalDocumentsService } from './medical-documents.service';
import { MedicalDocumentsController } from './medical-documents.controller';
import { PrismaModule } from '../../config/prisma.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: (req, file, cb) => {
          // Allow common medical document formats
          const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'application/rtf',
          ];

          if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Unsupported file type. Allowed formats: PDF, Images (JPEG, PNG, GIF), Word documents, Excel files, Text files, RTF'), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MedicalDocumentsController],
  providers: [MedicalDocumentsService],
  exports: [MedicalDocumentsService],
})
export class MedicalDocumentsModule {}