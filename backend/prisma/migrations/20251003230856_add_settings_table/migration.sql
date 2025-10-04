-- CreateTable
CREATE TABLE `treatment_plans` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `diagnosis` VARCHAR(500) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `review_date` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DRAFT') NOT NULL DEFAULT 'ACTIVE',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `overall_progress` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `objectives` JSON NULL,
    `patient_id` VARCHAR(191) NOT NULL,
    `doctor_id` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `updated_by` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `treatment_plans_patient_id_idx`(`patient_id`),
    INDEX `treatment_plans_doctor_id_idx`(`doctor_id`),
    INDEX `treatment_plans_status_idx`(`status`),
    INDEX `treatment_plans_start_date_idx`(`start_date`),
    INDEX `treatment_plans_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment_goals` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `target_value` VARCHAR(255) NULL,
    `current_value` VARCHAR(255) NULL,
    `unit` VARCHAR(50) NULL,
    `target_date` DATETIME(3) NULL,
    `achieved_date` DATETIME(3) NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'PARTIALLY_ACHIEVED', 'NOT_ACHIEVED', 'DISCONTINUED') NOT NULL DEFAULT 'NOT_STARTED',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `notes` TEXT NULL,
    `treatment_plan_id` VARCHAR(191) NOT NULL,
    `assigned_to` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `treatment_goals_treatment_plan_id_idx`(`treatment_plan_id`),
    INDEX `treatment_goals_status_idx`(`status`),
    INDEX `treatment_goals_target_date_idx`(`target_date`),
    INDEX `treatment_goals_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `instructions` TEXT NULL,
    `due_date` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `estimated_duration` INTEGER NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `task_type` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `completion_notes` TEXT NULL,
    `is_recurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrence_pattern` JSON NULL,
    `treatment_plan_id` VARCHAR(191) NOT NULL,
    `goal_id` VARCHAR(191) NULL,
    `assigned_to` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `treatment_tasks_treatment_plan_id_idx`(`treatment_plan_id`),
    INDEX `treatment_tasks_goal_id_idx`(`goal_id`),
    INDEX `treatment_tasks_status_idx`(`status`),
    INDEX `treatment_tasks_due_date_idx`(`due_date`),
    INDEX `treatment_tasks_task_type_idx`(`task_type`),
    INDEX `treatment_tasks_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment_progress` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `progress_type` VARCHAR(100) NOT NULL,
    `value` VARCHAR(255) NULL,
    `unit` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `observations` TEXT NULL,
    `attachments` JSON NULL,
    `treatment_plan_id` VARCHAR(191) NOT NULL,
    `goal_id` VARCHAR(191) NULL,
    `task_id` VARCHAR(191) NULL,
    `recorded_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `treatment_progress_treatment_plan_id_idx`(`treatment_plan_id`),
    INDEX `treatment_progress_goal_id_idx`(`goal_id`),
    INDEX `treatment_progress_task_id_idx`(`task_id`),
    INDEX `treatment_progress_date_idx`(`date`),
    INDEX `treatment_progress_progress_type_idx`(`progress_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `treatment_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `review_date` DATETIME(3) NOT NULL,
    `review_type` VARCHAR(100) NOT NULL,
    `overall_assessment` TEXT NULL,
    `progress_summary` TEXT NULL,
    `goals_assessment` JSON NULL,
    `recommendations` TEXT NULL,
    `adjustments` TEXT NULL,
    `next_steps` TEXT NULL,
    `next_review_date` DATETIME(3) NULL,
    `status_before` ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DRAFT') NULL,
    `status_after` ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DRAFT') NULL,
    `treatment_plan_id` VARCHAR(191) NOT NULL,
    `reviewed_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `treatment_reviews_treatment_plan_id_idx`(`treatment_plan_id`),
    INDEX `treatment_reviews_review_date_idx`(`review_date`),
    INDEX `treatment_reviews_review_type_idx`(`review_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SYSTEM', 'USER', 'HOSPITAL') NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` JSON NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `settings_type_idx`(`type`),
    INDEX `settings_category_idx`(`category`),
    INDEX `settings_user_id_idx`(`user_id`),
    UNIQUE INDEX `settings_type_category_key_user_id_key`(`type`, `category`, `key`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `treatment_plans` ADD CONSTRAINT `treatment_plans_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_plans` ADD CONSTRAINT `treatment_plans_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_plans` ADD CONSTRAINT `treatment_plans_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_plans` ADD CONSTRAINT `treatment_plans_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_goals` ADD CONSTRAINT `treatment_goals_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_goals` ADD CONSTRAINT `treatment_goals_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_goals` ADD CONSTRAINT `treatment_goals_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_tasks` ADD CONSTRAINT `treatment_tasks_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_tasks` ADD CONSTRAINT `treatment_tasks_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `treatment_goals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_tasks` ADD CONSTRAINT `treatment_tasks_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_tasks` ADD CONSTRAINT `treatment_tasks_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_progress` ADD CONSTRAINT `treatment_progress_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_progress` ADD CONSTRAINT `treatment_progress_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `treatment_goals`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_progress` ADD CONSTRAINT `treatment_progress_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `treatment_tasks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_progress` ADD CONSTRAINT `treatment_progress_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_reviews` ADD CONSTRAINT `treatment_reviews_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `treatment_reviews` ADD CONSTRAINT `treatment_reviews_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
