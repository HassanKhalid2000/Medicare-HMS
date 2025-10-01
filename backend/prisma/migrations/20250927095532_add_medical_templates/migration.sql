-- CreateTable
CREATE TABLE `medical_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `category` ENUM('VISIT_NOTES', 'REPORTS', 'FORMS', 'ASSESSMENTS', 'DISCHARGE_SUMMARIES', 'OPERATIVE_NOTES', 'CONSULTATION_NOTES', 'PROGRESS_NOTES', 'CUSTOM') NOT NULL,
    `templateType` ENUM('STRUCTURED_FORM', 'FREE_TEXT', 'CHECKLIST', 'QUESTIONNAIRE', 'CLINICAL_PATHWAY') NOT NULL,
    `content` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(191) NULL,
    `department_id` VARCHAR(191) NULL,
    `specialization` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_templates_category_idx`(`category`),
    INDEX `medical_templates_templateType_idx`(`templateType`),
    INDEX `medical_templates_is_active_idx`(`is_active`),
    INDEX `medical_templates_created_by_idx`(`created_by`),
    INDEX `medical_templates_specialization_idx`(`specialization`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medical_template_instances` (
    `id` VARCHAR(191) NOT NULL,
    `template_id` VARCHAR(191) NOT NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `medical_record_id` VARCHAR(191) NULL,
    `filledData` JSON NOT NULL,
    `completed_by` VARCHAR(191) NOT NULL,
    `completed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_modified_by` VARCHAR(191) NULL,
    `last_modified_at` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'SIGNED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `medical_template_instances_template_id_idx`(`template_id`),
    INDEX `medical_template_instances_patient_id_idx`(`patient_id`),
    INDEX `medical_template_instances_medical_record_id_idx`(`medical_record_id`),
    INDEX `medical_template_instances_completed_by_idx`(`completed_by`),
    INDEX `medical_template_instances_status_idx`(`status`),
    INDEX `medical_template_instances_completed_at_idx`(`completed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `medical_templates` ADD CONSTRAINT `medical_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_template_instances` ADD CONSTRAINT `medical_template_instances_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `medical_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_template_instances` ADD CONSTRAINT `medical_template_instances_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_template_instances` ADD CONSTRAINT `medical_template_instances_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_template_instances` ADD CONSTRAINT `medical_template_instances_completed_by_fkey` FOREIGN KEY (`completed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `medical_template_instances` ADD CONSTRAINT `medical_template_instances_last_modified_by_fkey` FOREIGN KEY (`last_modified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
