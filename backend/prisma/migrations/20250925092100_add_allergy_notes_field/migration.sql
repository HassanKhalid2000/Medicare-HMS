/*
  Warnings:

  - You are about to drop the column `allergies` on the `patients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `patients` DROP COLUMN `allergies`,
    ADD COLUMN `allergy_notes` TEXT NULL;

-- CreateTable
CREATE TABLE `medical_records` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `doctor_id` VARCHAR(191) NOT NULL,
    `appointment_id` VARCHAR(191) NULL,
    `record_type` ENUM('VISIT_NOTE', 'CONSULTATION', 'DISCHARGE_SUMMARY', 'PROGRESS_NOTE', 'OPERATIVE_REPORT', 'DIAGNOSTIC_REPORT') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `chief_complaint` TEXT NULL,
    `history_present` TEXT NULL,
    `review_systems` TEXT NULL,
    `physical_exam` TEXT NULL,
    `assessment` TEXT NULL,
    `plan` TEXT NULL,
    `follow_up_instructions` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_records_patient_id_idx`(`patient_id`),
    INDEX `medical_records_doctor_id_idx`(`doctor_id`),
    INDEX `medical_records_record_type_idx`(`record_type`),
    INDEX `medical_records_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diagnoses` (
    `id` VARCHAR(191) NOT NULL,
    `medical_record_id` VARCHAR(191) NOT NULL,
    `icd10_code` VARCHAR(20) NULL,
    `description` VARCHAR(500) NOT NULL,
    `type` ENUM('PRIMARY', 'SECONDARY', 'DIFFERENTIAL', 'PROVISIONAL', 'FINAL') NOT NULL,
    `notes` TEXT NULL,
    `diagnosed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolved_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `severity` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `diagnoses_medical_record_id_idx`(`medical_record_id`),
    INDEX `diagnoses_icd10_code_idx`(`icd10_code`),
    INDEX `diagnoses_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vital_signs` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `medical_record_id` VARCHAR(191) NULL,
    `type` ENUM('BLOOD_PRESSURE', 'HEART_RATE', 'TEMPERATURE', 'RESPIRATORY_RATE', 'OXYGEN_SATURATION', 'WEIGHT', 'HEIGHT', 'BMI', 'PAIN_SCALE') NOT NULL,
    `value` VARCHAR(50) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `normal_range` VARCHAR(100) NULL,
    `is_abnormal` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `measured_by` VARCHAR(255) NULL,
    `measured_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vital_signs_patient_id_idx`(`patient_id`),
    INDEX `vital_signs_type_idx`(`type`),
    INDEX `vital_signs_measured_at_idx`(`measured_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_prescriptions` (
    `id` VARCHAR(191) NOT NULL,
    `medical_record_id` VARCHAR(191) NOT NULL,
    `medicine_id` VARCHAR(191) NOT NULL,
    `dosage` VARCHAR(100) NOT NULL,
    `frequency` VARCHAR(100) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `refills` INTEGER NOT NULL DEFAULT 0,
    `instructions` TEXT NULL,
    `warnings` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `prescribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_prescriptions_medical_record_id_idx`(`medical_record_id`),
    INDEX `medical_prescriptions_medicine_id_idx`(`medicine_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatments` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `diagnosis_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'DISCONTINUED', 'ON_HOLD') NOT NULL DEFAULT 'ACTIVE',
    `instructions` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `treatments_patient_id_idx`(`patient_id`),
    INDEX `treatments_diagnosis_id_idx`(`diagnosis_id`),
    INDEX `treatments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_documents` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `medical_record_id` VARCHAR(191) NULL,
    `type` ENUM('PRESCRIPTION', 'LAB_REPORT', 'RADIOLOGY_REPORT', 'INSURANCE_DOCUMENT', 'CONSENT_FORM', 'MEDICAL_CERTIFICATE', 'OTHER') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `uploaded_by` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_documents_patient_id_idx`(`patient_id`),
    INDEX `medical_documents_type_idx`(`type`),
    INDEX `medical_documents_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `alert_type` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `severity` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `triggered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acknowledged_at` DATETIME(3) NULL,
    `acknowledged_by` VARCHAR(255) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `medical_alerts_patient_id_idx`(`patient_id`),
    INDEX `medical_alerts_severity_idx`(`severity`),
    INDEX `medical_alerts_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `allergies` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `allergen` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `reaction` TEXT NOT NULL,
    `severity` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL,
    `diagnosed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `allergies_patient_id_idx`(`patient_id`),
    INDEX `allergies_category_idx`(`category`),
    INDEX `allergies_severity_idx`(`severity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `immunizations` (
    `id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `vaccine_name` VARCHAR(255) NOT NULL,
    `brand_name` VARCHAR(255) NULL,
    `lot_number` VARCHAR(50) NULL,
    `dose_number` INTEGER NOT NULL,
    `total_doses` INTEGER NULL,
    `administered_date` DATETIME(3) NULL,
    `scheduled_date` DATETIME(3) NOT NULL,
    `status` ENUM('SCHEDULED', 'ADMINISTERED', 'OVERDUE', 'CONTRAINDICATED') NOT NULL DEFAULT 'SCHEDULED',
    `administered_by` VARCHAR(255) NULL,
    `site` VARCHAR(100) NULL,
    `route` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `reactions` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `immunizations_patient_id_idx`(`patient_id`),
    INDEX `immunizations_vaccine_name_idx`(`vaccine_name`),
    INDEX `immunizations_status_idx`(`status`),
    INDEX `immunizations_scheduled_date_idx`(`scheduled_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diagnoses` ADD CONSTRAINT `diagnoses_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vital_signs` ADD CONSTRAINT `vital_signs_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vital_signs` ADD CONSTRAINT `vital_signs_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_prescriptions` ADD CONSTRAINT `medical_prescriptions_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_prescriptions` ADD CONSTRAINT `medical_prescriptions_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatments` ADD CONSTRAINT `treatments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatments` ADD CONSTRAINT `treatments_diagnosis_id_fkey` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnoses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_documents` ADD CONSTRAINT `medical_documents_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_documents` ADD CONSTRAINT `medical_documents_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_alerts` ADD CONSTRAINT `medical_alerts_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `allergies` ADD CONSTRAINT `allergies_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `immunizations` ADD CONSTRAINT `immunizations_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
