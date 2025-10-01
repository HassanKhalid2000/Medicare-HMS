-- AlterTable
ALTER TABLE `lab_tests` MODIFY `status` ENUM('requested', 'sample_collected', 'processing', 'completed', 'cancelled', 'failed', 'on_hold') NOT NULL DEFAULT 'requested';

-- CreateTable
CREATE TABLE `lab_panels` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `cost` DECIMAL(10, 2) NULL,
    `turnaround_time` INTEGER NULL,
    `instructions` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lab_panels_category_idx`(`category`),
    INDEX `lab_panels_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_test_panels` (
    `id` VARCHAR(191) NOT NULL,
    `lab_test_id` VARCHAR(191) NOT NULL,
    `panel_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `lab_test_panels_lab_test_id_panel_id_key`(`lab_test_id`, `panel_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_parameters` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `unit` VARCHAR(50) NOT NULL,
    `normal_range_min` DECIMAL(10, 4) NULL,
    `normal_range_max` DECIMAL(10, 4) NULL,
    `critical_min` DECIMAL(10, 4) NULL,
    `critical_max` DECIMAL(10, 4) NULL,
    `category` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lab_parameters_code_key`(`code`),
    INDEX `lab_parameters_code_idx`(`code`),
    INDEX `lab_parameters_category_idx`(`category`),
    INDEX `lab_parameters_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_panel_tests` (
    `id` VARCHAR(191) NOT NULL,
    `panel_id` VARCHAR(191) NOT NULL,
    `parameter_id` VARCHAR(191) NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `lab_panel_tests_panel_id_parameter_id_key`(`panel_id`, `parameter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_results` (
    `id` VARCHAR(191) NOT NULL,
    `lab_test_id` VARCHAR(191) NOT NULL,
    `parameter_id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `numeric_value` DECIMAL(15, 6) NULL,
    `unit` VARCHAR(50) NOT NULL,
    `reference_range` VARCHAR(100) NULL,
    `status` ENUM('pending', 'normal', 'abnormal', 'critical', 'reviewed') NOT NULL DEFAULT 'pending',
    `interpretation` ENUM('normal', 'high', 'low', 'critical_high', 'critical_low', 'abnormal') NOT NULL DEFAULT 'normal',
    `flags` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `verified_by` VARCHAR(255) NULL,
    `verified_at` DATETIME(3) NULL,
    `is_abnormal` BOOLEAN NOT NULL DEFAULT false,
    `is_critical` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lab_results_lab_test_id_idx`(`lab_test_id`),
    INDEX `lab_results_parameter_id_idx`(`parameter_id`),
    INDEX `lab_results_status_idx`(`status`),
    INDEX `lab_results_interpretation_idx`(`interpretation`),
    INDEX `lab_results_is_abnormal_idx`(`is_abnormal`),
    INDEX `lab_results_is_critical_idx`(`is_critical`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lab_reference_ranges` (
    `id` VARCHAR(191) NOT NULL,
    `parameter_id` VARCHAR(191) NOT NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `age_min` INTEGER NULL,
    `age_max` INTEGER NULL,
    `normal_min` DECIMAL(10, 4) NOT NULL,
    `normal_max` DECIMAL(10, 4) NOT NULL,
    `critical_min` DECIMAL(10, 4) NULL,
    `critical_max` DECIMAL(10, 4) NULL,
    `unit` VARCHAR(50) NOT NULL,
    `condition` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lab_reference_ranges_parameter_id_idx`(`parameter_id`),
    INDEX `lab_reference_ranges_gender_idx`(`gender`),
    INDEX `lab_reference_ranges_age_min_age_max_idx`(`age_min`, `age_max`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lab_test_panels` ADD CONSTRAINT `lab_test_panels_lab_test_id_fkey` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_test_panels` ADD CONSTRAINT `lab_test_panels_panel_id_fkey` FOREIGN KEY (`panel_id`) REFERENCES `lab_panels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_panel_tests` ADD CONSTRAINT `lab_panel_tests_panel_id_fkey` FOREIGN KEY (`panel_id`) REFERENCES `lab_panels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_panel_tests` ADD CONSTRAINT `lab_panel_tests_parameter_id_fkey` FOREIGN KEY (`parameter_id`) REFERENCES `lab_parameters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_lab_test_id_fkey` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lab_results` ADD CONSTRAINT `lab_results_parameter_id_fkey` FOREIGN KEY (`parameter_id`) REFERENCES `lab_parameters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
