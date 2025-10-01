-- CreateTable
CREATE TABLE `medical_reports` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('PATIENT_SUMMARY', 'MEDICAL_HISTORY', 'PRESCRIPTION_REPORT', 'VITAL_SIGNS_REPORT', 'LAB_RESULTS_REPORT', 'ADMISSION_REPORT', 'FINANCIAL_REPORT', 'APPOINTMENT_REPORT', 'DIAGNOSIS_REPORT', 'CUSTOM_REPORT') NOT NULL,
    `format` ENUM('PDF', 'CSV', 'EXCEL', 'JSON') NOT NULL DEFAULT 'PDF',
    `status` ENUM('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `parameters` JSON NULL,
    `filters` JSON NULL,
    `file_path` VARCHAR(500) NULL,
    `file_name` VARCHAR(255) NULL,
    `file_size` INTEGER NULL,
    `requested_by` VARCHAR(191) NOT NULL,
    `generated_by` VARCHAR(191) NULL,
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `started_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `error_message` TEXT NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_reports_type_idx`(`type`),
    INDEX `medical_reports_status_idx`(`status`),
    INDEX `medical_reports_requested_by_idx`(`requested_by`),
    INDEX `medical_reports_requested_at_idx`(`requested_at`),
    INDEX `medical_reports_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('PATIENT_SUMMARY', 'MEDICAL_HISTORY', 'PRESCRIPTION_REPORT', 'VITAL_SIGNS_REPORT', 'LAB_RESULTS_REPORT', 'ADMISSION_REPORT', 'FINANCIAL_REPORT', 'APPOINTMENT_REPORT', 'DIAGNOSIS_REPORT', 'CUSTOM_REPORT') NOT NULL,
    `defaultFormat` ENUM('PDF', 'CSV', 'EXCEL', 'JSON') NOT NULL DEFAULT 'PDF',
    `templateConfig` JSON NOT NULL,
    `defaultParams` JSON NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `report_templates_type_idx`(`type`),
    INDEX `report_templates_is_public_idx`(`is_public`),
    INDEX `report_templates_is_active_idx`(`is_active`),
    INDEX `report_templates_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_templates` ADD CONSTRAINT `report_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
