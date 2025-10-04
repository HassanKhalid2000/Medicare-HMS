-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 04, 2025 at 10:29 AM
-- Server version: 9.3.0
-- PHP Version: 8.4.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medicore_hms`
--

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--

CREATE TABLE `admissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` enum('General','ICU','CCU','Pediatric','Maternity','Surgical','Emergency') COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bed_number` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admission_date` date NOT NULL,
  `discharge_date` date DEFAULT NULL,
  `admission_type` enum('emergency','planned','transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `status` enum('admitted','discharged','transferred') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admitted',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `discharge_summary` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admissions`
--

INSERT INTO `admissions` (`id`, `patient_id`, `doctor_id`, `ward`, `room_number`, `bed_number`, `admission_date`, `discharge_date`, `admission_type`, `reason`, `status`, `notes`, `discharge_summary`, `created_at`, `updated_at`) VALUES
('67d5c799-81ae-4505-a2cb-c8afbfa4dda5', '9e867098-fb7a-4488-accc-fee5aeef2487', '8dfbc14d-876f-4899-97ba-983fa4a855fa', 'General', 'G-101', 'B-1', '2024-12-20', NULL, 'emergency', 'Severe abdominal pain and fever. Suspected appendicitis requiring immediate medical attention.', 'admitted', 'Patient admitted through emergency department. Vitals stable. Scheduled for appendectomy.', NULL, '2025-10-04 09:07:14.488', '2025-10-04 09:07:14.488'),
('b9c5c77f-195d-4250-acbc-2a129a87a362', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', '4e32d082-98b1-4348-a13d-a6614918429f', 'ICU', 'ICU-3', 'B-1', '2024-12-18', '2024-12-22', 'planned', 'Cardiac catheterization and angioplasty procedure. Pre-operative preparation required.', 'discharged', 'Planned admission for cardiac intervention. Patient responded well to treatment.', 'Successful cardiac catheterization with angioplasty. Two stents placed in LAD. Patient stable at discharge. Follow-up in cardiology clinic in 2 weeks. Continue dual antiplatelet therapy as prescribed.', '2025-10-04 09:07:14.492', '2025-10-04 09:07:14.492'),
('fc00c18a-e278-4bb6-b60e-fa043dccd6e2', '67fe7667-8f35-4549-945a-f88d33079473', '48a85bd7-7069-471e-932c-971c52c254eb', 'Maternity', 'M-205', 'B-2', '2024-12-25', NULL, 'planned', 'Scheduled cesarean section delivery at 38 weeks gestation.', 'admitted', 'Planned C-section admission. Pre-operative labs completed. Patient and baby monitoring ongoing.', NULL, '2025-10-04 09:07:14.494', '2025-10-04 09:07:14.494');

-- --------------------------------------------------------

--
-- Table structure for table `allergies`
--

CREATE TABLE `allergies` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allergen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reaction` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `diagnosed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `duration` int NOT NULL DEFAULT '30',
  `type` enum('consultation','follow_up','emergency','routine_checkup') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('scheduled','confirmed','completed','cancelled','no_show') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `symptoms` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` text COLLATE utf8mb4_unicode_ci,
  `prescription` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `duration`, `type`, `status`, `notes`, `symptoms`, `diagnosis`, `prescription`, `created_at`, `updated_at`) VALUES
('4936fe3f-a01e-4f75-a1d4-602807bd6fee', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', '4e32d082-98b1-4348-a13d-a6614918429f', '2025-10-05', '07:30:00', 30, 'follow_up', 'confirmed', 'Follow-up for diabetes management', NULL, NULL, NULL, '2025-10-04 09:07:14.455', '2025-10-04 09:07:14.455'),
('ba964916-c6fe-406f-8000-7af7c69d52c4', '9e867098-fb7a-4488-accc-fee5aeef2487', '8dfbc14d-876f-4899-97ba-983fa4a855fa', '2025-10-05', '06:00:00', 30, 'consultation', 'scheduled', 'Regular checkup', NULL, NULL, NULL, '2025-10-04 09:07:14.455', '2025-10-04 09:07:14.455');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bills`
--

CREATE TABLE `bills` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `paid_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('cash','card','bank_transfer','insurance') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('pending','partial','paid','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `due_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bills`
--

INSERT INTO `bills` (`id`, `invoice_number`, `patient_id`, `total_amount`, `tax_amount`, `discount_amount`, `paid_amount`, `payment_method`, `payment_status`, `due_date`, `notes`, `created_at`, `updated_at`) VALUES
('2251a3ff-7942-47e4-ad4c-ea46182190a7', 'INV-2024-0922-001', '9e867098-fb7a-4488-accc-fee5aeef2487', 200.00, 20.00, 0.00, 0.00, NULL, 'pending', '2025-11-03', 'Consultation fee', '2025-10-04 09:07:14.468', '2025-10-04 09:07:14.468');

-- --------------------------------------------------------

--
-- Table structure for table `bill_items`
--

CREATE TABLE `bill_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bill_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bill_items`
--

INSERT INTO `bill_items` (`id`, `bill_id`, `description`, `quantity`, `unit_price`, `total_price`) VALUES
('7a63906f-5a0e-4ac3-9a62-41288b95f03c', '2251a3ff-7942-47e4-ad4c-ea46182190a7', 'ECG Test', 1, 50.00, 50.00),
('ff81b99d-9b46-4577-8490-07ac3a8f39f3', '2251a3ff-7942-47e4-ad4c-ea46182190a7', 'Consultation - Cardiology', 1, 150.00, 150.00);

-- --------------------------------------------------------

--
-- Table structure for table `diagnoses`
--

CREATE TABLE `diagnoses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_record_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icd10_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('PRIMARY','SECONDARY','DIFFERENTIAL','PROVISIONAL','FINAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `diagnosed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `resolved_at` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `severity` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialization` enum('General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics','Gynecology','Dermatology','Psychiatry','Radiology','Anesthesiology','Emergency Medicine','Surgery') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `experience_years` int NOT NULL DEFAULT '0',
  `schedule` text COLLATE utf8mb4_unicode_ci,
  `consultation_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('active','inactive','on_leave') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `doctor_id`, `name`, `specialization`, `phone`, `email`, `license_number`, `experience_years`, `schedule`, `consultation_fee`, `status`, `created_at`, `updated_at`) VALUES
('48a85bd7-7069-471e-932c-971c52c254eb', 'DOC003', 'Dr. Ahmed Hassan', 'Orthopedics', '+1234567895', 'dr.ahmed.hassan@medicore.com', 'LIC003', 12, '10:00 AM - 6:00 PM (Mon-Fri)', 180.00, 'active', '2025-10-04 09:07:14.437', '2025-10-04 09:07:14.437'),
('4e32d082-98b1-4348-a13d-a6614918429f', 'DOC002', 'Dr. Sarah Ahmad', 'Pediatrics', '+1234567894', 'dr.sarah.ahmad@medicore.com', 'LIC002', 8, '8:00 AM - 4:00 PM (Mon-Sat)', 120.00, 'active', '2025-10-04 09:07:14.437', '2025-10-04 09:07:14.437'),
('8dfbc14d-876f-4899-97ba-983fa4a855fa', 'DOC001', 'Doctor User', 'Cardiology', '+1234567891', 'doctor@medicore.com', 'LIC001', 15, '9:00 AM - 5:00 PM (Mon-Fri)', 150.00, 'active', '2025-10-04 09:07:14.437', '2025-10-04 09:07:14.437');

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_permissions`
--

CREATE TABLE `group_permissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `immunizations`
--

CREATE TABLE `immunizations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vaccine_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lot_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dose_number` int NOT NULL,
  `total_doses` int DEFAULT NULL,
  `administered_date` datetime(3) DEFAULT NULL,
  `scheduled_date` datetime(3) NOT NULL,
  `status` enum('SCHEDULED','ADMINISTERED','OVERDUE','CONTRAINDICATED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `administered_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `route` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `reactions` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lab_panels`
--

CREATE TABLE `lab_panels` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `cost` decimal(10,2) DEFAULT NULL,
  `turnaround_time` int DEFAULT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_panels`
--

INSERT INTO `lab_panels` (`id`, `name`, `description`, `category`, `is_active`, `cost`, `turnaround_time`, `instructions`, `created_at`, `updated_at`) VALUES
('698aea54-9c73-4308-9cab-a641d14b4547', 'Diabetes Panel', 'Blood glucose and HbA1c testing', 'Endocrinology', 1, 65.00, 24, 'Fasting glucose requires 8-12 hours fasting', '2025-10-04 09:07:14.480', '2025-10-04 09:07:14.480'),
('7fa737c1-cbd7-447f-a488-03dea0b912f4', 'Lipid Profile', 'Comprehensive lipid analysis', 'Cardiology', 1, 85.00, 24, 'Patient must fast for 12 hours before test', '2025-10-04 09:07:14.480', '2025-10-04 09:07:14.480'),
('890bd6b2-40f0-45ae-8778-1dba67395e45', 'Complete Blood Count', 'Full blood cell analysis', 'Hematology', 1, 45.00, 4, 'No special preparation required', '2025-10-04 09:07:14.480', '2025-10-04 09:07:14.480');

-- --------------------------------------------------------

--
-- Table structure for table `lab_panel_tests`
--

CREATE TABLE `lab_panel_tests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `panel_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parameter_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_panel_tests`
--

INSERT INTO `lab_panel_tests` (`id`, `panel_id`, `parameter_id`, `is_required`, `display_order`, `created_at`) VALUES
('4b573898-a55f-4eea-a815-42e49494c597', '7fa737c1-cbd7-447f-a488-03dea0b912f4', '4a487034-8625-458a-8f9a-6d46ce43bfa2', 1, 3, '2025-10-04 09:07:14.482'),
('8192bf67-3f00-400c-8c34-147826428038', '7fa737c1-cbd7-447f-a488-03dea0b912f4', '5dc9524d-c0eb-430c-8806-4cb0231c4fb3', 1, 2, '2025-10-04 09:07:14.482'),
('83a289aa-87d7-4688-96a1-9745cddde393', '890bd6b2-40f0-45ae-8778-1dba67395e45', '380e87f1-c0c0-47c1-8426-90a3821c7853', 1, 1, '2025-10-04 09:07:14.482'),
('a5937fb6-f02f-41da-bfee-ba46d0d936ce', '698aea54-9c73-4308-9cab-a641d14b4547', 'c73dd8e7-6da0-49c2-9121-f05ab336a749', 1, 1, '2025-10-04 09:07:14.482'),
('bcfcb192-44f4-4175-86dc-c070865437a0', '698aea54-9c73-4308-9cab-a641d14b4547', '487f1259-45bd-4a1f-8e0e-556ac663b261', 1, 2, '2025-10-04 09:07:14.482'),
('d1be2630-e8ec-4039-bc7a-4cdc746ee953', '890bd6b2-40f0-45ae-8778-1dba67395e45', '136c8a23-9afd-4707-a605-613f3a60f38a', 1, 2, '2025-10-04 09:07:14.482'),
('e458301f-2d11-480f-8af6-bb0c3109e444', '7fa737c1-cbd7-447f-a488-03dea0b912f4', '8a6cd24d-526c-4c2c-9b89-f9d32e8af1bc', 1, 1, '2025-10-04 09:07:14.482'),
('e90aed41-bb06-473b-9b05-522dc4b37c92', '890bd6b2-40f0-45ae-8778-1dba67395e45', '12f733fd-5ec4-4b4a-a44c-8b60fac5e092', 1, 3, '2025-10-04 09:07:14.482');

-- --------------------------------------------------------

--
-- Table structure for table `lab_parameters`
--

CREATE TABLE `lab_parameters` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `normal_range_min` decimal(10,4) DEFAULT NULL,
  `normal_range_max` decimal(10,4) DEFAULT NULL,
  `critical_min` decimal(10,4) DEFAULT NULL,
  `critical_max` decimal(10,4) DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_parameters`
--

INSERT INTO `lab_parameters` (`id`, `code`, `name`, `description`, `unit`, `normal_range_min`, `normal_range_max`, `critical_min`, `critical_max`, `category`, `is_active`, `created_at`, `updated_at`) VALUES
('12f733fd-5ec4-4b4a-a44c-8b60fac5e092', 'HGB', 'Hemoglobin', 'Hemoglobin concentration', 'g/dL', 12.0000, 16.0000, 6.0000, 20.0000, 'Complete Blood Count', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('136c8a23-9afd-4707-a605-613f3a60f38a', 'RBC', 'Red Blood Cells', 'Red blood cell count', 'million/µL', 4.2000, 5.4000, 2.0000, 8.0000, 'Complete Blood Count', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('380e87f1-c0c0-47c1-8426-90a3821c7853', 'WBC', 'White Blood Cells', 'White blood cell count', '/µL', 4000.0000, 11000.0000, 1000.0000, 50000.0000, 'Complete Blood Count', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('487f1259-45bd-4a1f-8e0e-556ac663b261', 'HBA1C', 'HbA1c', 'Glycated hemoglobin', '%', 4.0000, 5.6000, 2.0000, 15.0000, 'Diabetes Panel', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('4a487034-8625-458a-8f9a-6d46ce43bfa2', 'LDL', 'LDL Cholesterol', 'Low-density lipoprotein cholesterol', 'mg/dL', 70.0000, 100.0000, 30.0000, 300.0000, 'Lipid Profile', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('5dc9524d-c0eb-430c-8806-4cb0231c4fb3', 'HDL', 'HDL Cholesterol', 'High-density lipoprotein cholesterol', 'mg/dL', 40.0000, 60.0000, 15.0000, 100.0000, 'Lipid Profile', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('8a6cd24d-526c-4c2c-9b89-f9d32e8af1bc', 'CHOL', 'Total Cholesterol', 'Total cholesterol measurement', 'mg/dL', 125.0000, 200.0000, 50.0000, 400.0000, 'Lipid Profile', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476'),
('c73dd8e7-6da0-49c2-9121-f05ab336a749', 'GLUC', 'Glucose', 'Blood glucose level', 'mg/dL', 70.0000, 100.0000, 40.0000, 500.0000, 'Diabetes Panel', 1, '2025-10-04 09:07:14.476', '2025-10-04 09:07:14.476');

-- --------------------------------------------------------

--
-- Table structure for table `lab_reference_ranges`
--

CREATE TABLE `lab_reference_ranges` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parameter_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age_min` int DEFAULT NULL,
  `age_max` int DEFAULT NULL,
  `normal_min` decimal(10,4) NOT NULL,
  `normal_max` decimal(10,4) NOT NULL,
  `critical_min` decimal(10,4) DEFAULT NULL,
  `critical_max` decimal(10,4) DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lab_results`
--

CREATE TABLE `lab_results` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lab_test_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parameter_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numeric_value` decimal(15,6) DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','normal','abnormal','critical','reviewed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `interpretation` enum('normal','high','low','critical_high','critical_low','abnormal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `flags` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `verified_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verified_at` datetime(3) DEFAULT NULL,
  `is_abnormal` tinyint(1) NOT NULL DEFAULT '0',
  `is_critical` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_results`
--

INSERT INTO `lab_results` (`id`, `lab_test_id`, `parameter_id`, `value`, `numeric_value`, `unit`, `reference_range`, `status`, `interpretation`, `flags`, `notes`, `verified_by`, `verified_at`, `is_abnormal`, `is_critical`, `created_at`, `updated_at`) VALUES
('14a2a779-4816-4c8b-b8d8-82aad678d7c7', '7d6820a4-6c85-4bcd-92c4-4bc5083fa62a', '5dc9524d-c0eb-430c-8806-4cb0231c4fb3', '35', 35.000000, 'mg/dL', '40-60 mg/dL', 'abnormal', 'low', 'L', NULL, 'Lab Technician A', '2025-10-04 09:07:14.483', 1, 0, '2025-10-04 09:07:14.484', '2025-10-04 09:07:14.484'),
('41e89d39-44f1-4819-9d47-ca1dc1f2e996', '7d6820a4-6c85-4bcd-92c4-4bc5083fa62a', '8a6cd24d-526c-4c2c-9b89-f9d32e8af1bc', '245', 245.000000, 'mg/dL', '125-200 mg/dL', 'abnormal', 'high', 'H', NULL, 'Lab Technician A', '2025-10-04 09:07:14.483', 1, 0, '2025-10-04 09:07:14.484', '2025-10-04 09:07:14.484'),
('857909a1-8bc5-43df-a2d8-e729c4ea668d', '7d6820a4-6c85-4bcd-92c4-4bc5083fa62a', '4a487034-8625-458a-8f9a-6d46ce43bfa2', '175', 175.000000, 'mg/dL', '70-100 mg/dL', 'abnormal', 'high', 'H', NULL, 'Lab Technician A', '2025-10-04 09:07:14.483', 1, 0, '2025-10-04 09:07:14.484', '2025-10-04 09:07:14.484');

-- --------------------------------------------------------

--
-- Table structure for table `lab_tests`
--

CREATE TABLE `lab_tests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `test_type` enum('Blood Tests','Urine Tests','X-Ray','CT Scan','MRI','ECG','Ultrasound','Biopsy') COLLATE utf8mb4_unicode_ci NOT NULL,
  `urgency` enum('routine','urgent','stat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'routine',
  `status` enum('requested','sample_collected','processing','completed','cancelled','failed','on_hold') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `sample_info` text COLLATE utf8mb4_unicode_ci,
  `results` text COLLATE utf8mb4_unicode_ci,
  `normal_ranges` text COLLATE utf8mb4_unicode_ci,
  `technician` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `collected_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `report_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lab_tests`
--

INSERT INTO `lab_tests` (`id`, `test_number`, `patient_id`, `doctor_id`, `test_type`, `urgency`, `status`, `sample_info`, `results`, `normal_ranges`, `technician`, `cost`, `requested_at`, `collected_at`, `completed_at`, `report_url`, `notes`, `created_at`, `updated_at`) VALUES
('317ad153-9d8c-42af-95dd-c631dd52fc24', 'LAB-2024-002', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', '4e32d082-98b1-4348-a13d-a6614918429f', 'X-Ray', 'urgent', 'sample_collected', 'Chest X-ray', NULL, NULL, NULL, 80.00, '2025-10-04 09:07:14.473', '2025-10-04 09:07:14.472', NULL, NULL, 'Check for pneumonia', '2025-10-04 09:07:14.473', '2025-10-04 09:07:14.473'),
('7d6820a4-6c85-4bcd-92c4-4bc5083fa62a', 'LAB-2024-001', '9e867098-fb7a-4488-accc-fee5aeef2487', '8dfbc14d-876f-4899-97ba-983fa4a855fa', 'Blood Tests', 'routine', 'completed', 'Fasting blood sample required', 'Lipid profile shows elevated cholesterol and LDL, low HDL. Recommend dietary changes and statin therapy.', NULL, NULL, 50.00, '2025-10-04 09:07:14.473', NULL, '2025-10-04 09:07:14.486', NULL, 'Check cholesterol levels', '2025-10-04 09:07:14.473', '2025-10-04 09:07:14.486');

-- --------------------------------------------------------

--
-- Table structure for table `lab_test_panels`
--

CREATE TABLE `lab_test_panels` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lab_test_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `panel_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_alerts`
--

CREATE TABLE `medical_alerts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alert_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('LOW','MEDIUM','HIGH','CRITICAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `triggered_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `acknowledged_at` datetime(3) DEFAULT NULL,
  `acknowledged_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_documents`
--

CREATE TABLE `medical_documents` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_record_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('PRESCRIPTION','LAB_REPORT','RADIOLOGY_REPORT','INSURANCE_DOCUMENT','CONSENT_FORM','MEDICAL_CERTIFICATE','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medical_documents`
--

INSERT INTO `medical_documents` (`id`, `patient_id`, `medical_record_id`, `type`, `title`, `description`, `file_path`, `file_name`, `file_size`, `mime_type`, `uploaded_by`, `is_active`, `created_at`, `updated_at`) VALUES
('02c8ed6e-b5b4-4f3f-9fa9-c24e7c5ef7cd', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', NULL, 'INSURANCE_DOCUMENT', 'Insurance Coverage Verification', 'Updated insurance card and coverage details for treatment authorization', '/uploads/medical-documents/insurance-card-002.jpg', 'insurance-card.jpg', 234567, 'image/jpeg', 'abeer.babiker@medicore.com', 1, '2025-10-04 09:07:14.512', '2025-10-04 09:07:14.512'),
('28203129-d3ff-49e9-a6fc-fd2271db8123', '67fe7667-8f35-4549-945a-f88d33079473', NULL, 'CONSENT_FORM', 'Surgical Consent Form', 'Signed consent form for upcoming appendectomy procedure', '/uploads/medical-documents/surgical-consent-003.pdf', 'surgical-consent-form.pdf', 198765, 'application/pdf', 'dr.hiba.yassir@medicore.com', 1, '2025-10-04 09:07:14.513', '2025-10-04 09:07:14.513'),
('2b2b6cb8-da7d-4c3e-8a04-7cc9dd7756d0', '67fe7667-8f35-4549-945a-f88d33079473', NULL, 'MEDICAL_CERTIFICATE', 'Medical Certificate for Work Leave', 'Medical certificate recommending 2 weeks of bed rest post surgery', '/uploads/medical-documents/medical-cert-003.pdf', 'medical-certificate.pdf', 156789, 'application/pdf', 'dr.mohammed.ali@medicore.com', 1, '2025-10-04 09:07:14.514', '2025-10-04 09:07:14.514'),
('3ce61189-cec7-4778-853f-fcdc2357241e', '9e867098-fb7a-4488-accc-fee5aeef2487', NULL, 'LAB_REPORT', 'Blood Test Results - Lipid Panel', 'Complete lipid panel showing cholesterol levels within normal range', '/uploads/medical-documents/lab-lipid-panel-001.pdf', 'lipid-panel-results.pdf', 189430, 'application/pdf', 'dr.mohammed.ali@medicore.com', 1, '2025-10-04 09:07:14.509', '2025-10-04 09:07:14.509'),
('be68ece2-02ba-4d96-853f-3913ca780866', '9e867098-fb7a-4488-accc-fee5aeef2487', NULL, 'PRESCRIPTION', 'Prescription for Blood Pressure Medication', 'Prescription for Lisinopril 10mg daily for hypertension management', '/uploads/medical-documents/prescription-bp-001.pdf', 'prescription-bp-medication.pdf', 245760, 'application/pdf', 'dr.mohammed.ali@medicore.com', 1, '2025-10-04 09:07:14.508', '2025-10-04 09:07:14.508'),
('c1750d7e-39b1-410c-ae4e-ec095784082f', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', NULL, 'RADIOLOGY_REPORT', 'Chest X-Ray Report', 'Chest X-ray showing clear lungs, no signs of pneumonia or other abnormalities', '/uploads/medical-documents/chest-xray-002.pdf', 'chest-xray-report.pdf', 567890, 'application/pdf', 'dr.mohammed.ali@medicore.com', 1, '2025-10-04 09:07:14.510', '2025-10-04 09:07:14.510');

-- --------------------------------------------------------

--
-- Table structure for table `medical_prescriptions`
--

CREATE TABLE `medical_prescriptions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_record_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicine_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `refills` int NOT NULL DEFAULT '0',
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `warnings` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `prescribed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `appointment_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_type` enum('VISIT_NOTE','CONSULTATION','DISCHARGE_SUMMARY','PROGRESS_NOTE','OPERATIVE_REPORT','DIAGNOSTIC_REPORT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chief_complaint` text COLLATE utf8mb4_unicode_ci,
  `history_present` text COLLATE utf8mb4_unicode_ci,
  `review_systems` text COLLATE utf8mb4_unicode_ci,
  `physical_exam` text COLLATE utf8mb4_unicode_ci,
  `assessment` text COLLATE utf8mb4_unicode_ci,
  `plan` text COLLATE utf8mb4_unicode_ci,
  `follow_up_instructions` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_reports`
--

CREATE TABLE `medical_reports` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('PATIENT_SUMMARY','MEDICAL_HISTORY','PRESCRIPTION_REPORT','VITAL_SIGNS_REPORT','LAB_RESULTS_REPORT','ADMISSION_REPORT','FINANCIAL_REPORT','APPOINTMENT_REPORT','DIAGNOSIS_REPORT','CUSTOM_REPORT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` enum('PDF','CSV','EXCEL','JSON') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PDF',
  `status` enum('PENDING','GENERATING','COMPLETED','FAILED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `parameters` json DEFAULT NULL,
  `filters` json DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `requested_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `generated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `retry_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medical_reports`
--

INSERT INTO `medical_reports` (`id`, `title`, `description`, `type`, `format`, `status`, `parameters`, `filters`, `file_path`, `file_name`, `file_size`, `requested_by`, `generated_by`, `requested_at`, `started_at`, `completed_at`, `expires_at`, `error_message`, `retry_count`, `created_at`, `updated_at`) VALUES
('1ec9faea-ed95-411f-9255-194f31ee19c4', 'Monthly Prescription Report', 'Analysis of prescriptions issued in the current month', 'PRESCRIPTION_REPORT', 'EXCEL', 'COMPLETED', NULL, '{\"endDate\": \"2024-12-31\", \"doctorId\": \"8dfbc14d-876f-4899-97ba-983fa4a855fa\", \"startDate\": \"2024-12-01\"}', '/uploads/reports/prescription-monthly-001.xlsx', NULL, 98304, '1fae546b-ae57-4986-8b5e-5a9701adbe07', NULL, '2025-10-04 09:07:14.517', NULL, NULL, '2025-11-03 09:07:14.517', NULL, 0, '2025-10-04 09:07:14.517', '2025-10-04 09:07:14.517'),
('2b1ba3e2-efd1-4091-b22c-4f6ccdf2fada', 'Admission Statistics Report', 'Hospital admission trends and capacity analysis', 'ADMISSION_REPORT', 'CSV', 'FAILED', NULL, '{\"endDate\": \"2024-12-31\", \"startDate\": \"2024-11-01\", \"departmentId\": \"emergency\"}', NULL, NULL, NULL, '435098b9-1a98-401a-a3f1-2365a4424824', NULL, '2025-10-04 09:07:14.519', NULL, NULL, '2025-11-03 09:07:14.519', NULL, 0, '2025-10-04 09:07:14.519', '2025-10-04 09:07:14.519'),
('8162e92e-deb9-423f-926c-c356925e08cb', 'Patient Summary Report - John Doe', 'Comprehensive patient medical summary including recent admissions and test results', 'PATIENT_SUMMARY', 'PDF', 'COMPLETED', NULL, '{\"endDate\": \"2024-12-31\", \"patientId\": \"9e867098-fb7a-4488-accc-fee5aeef2487\", \"startDate\": \"2024-01-01\"}', '/uploads/reports/patient-summary-001.pdf', NULL, 245760, '435098b9-1a98-401a-a3f1-2365a4424824', NULL, '2025-10-04 09:07:14.515', NULL, NULL, '2025-11-03 09:07:14.514', NULL, 0, '2025-10-04 09:07:14.515', '2025-10-04 09:07:14.515'),
('dff21f22-07b8-4e79-9eee-953262880e13', 'Vital Signs Analysis Report', 'Trends and patterns in patient vital signs over the past quarter', 'VITAL_SIGNS_REPORT', 'PDF', 'PENDING', NULL, '{\"endDate\": \"2024-12-31\", \"startDate\": \"2024-10-01\"}', NULL, NULL, NULL, '9733f939-5128-4c51-a602-c6b865fa2c49', NULL, '2025-10-04 09:07:14.518', NULL, NULL, '2025-11-03 09:07:14.518', NULL, 0, '2025-10-04 09:07:14.518', '2025-10-04 09:07:14.518');

-- --------------------------------------------------------

--
-- Table structure for table `medical_templates`
--

CREATE TABLE `medical_templates` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('VISIT_NOTES','REPORTS','FORMS','ASSESSMENTS','DISCHARGE_SUMMARIES','OPERATIVE_NOTES','CONSULTATION_NOTES','PROGRESS_NOTES','CUSTOM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `templateType` enum('STRUCTURED_FORM','FREE_TEXT','CHECKLIST','QUESTIONNAIRE','CLINICAL_PATHWAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` json NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_template_instances`
--

CREATE TABLE `medical_template_instances` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_record_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filledData` json NOT NULL,
  `completed_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_modified_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_modified_at` datetime(3) DEFAULT NULL,
  `status` enum('DRAFT','IN_PROGRESS','COMPLETED','REVIEWED','SIGNED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `unit_price` decimal(10,2) NOT NULL,
  `minimum_stock` int NOT NULL DEFAULT '10',
  `description` text COLLATE utf8mb4_unicode_ci,
  `side_effects` text COLLATE utf8mb4_unicode_ci,
  `dosage_info` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`id`, `name`, `category`, `manufacturer`, `batch_number`, `expiry_date`, `quantity`, `unit_price`, `minimum_stock`, `description`, `side_effects`, `dosage_info`, `created_at`, `updated_at`) VALUES
('med-1', 'Aspirin', 'Pain Relief', 'Pharma Corp', 'ASP2024001', '2025-12-31', 500, 0.50, 50, 'Pain relief and anti-inflammatory medication', 'May cause stomach irritation', '1-2 tablets every 4-6 hours as needed', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-10', 'Losartan', 'Cardiovascular', 'CardioMed', 'LOS2024001', '2026-04-30', 220, 1.90, 22, 'ARB medication for hypertension', 'Dizziness, back pain, nasal congestion', '50mg once daily', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-11', 'Cetirizine', 'Antihistamine', 'AllergyRelief Inc', 'CET2024001', '2025-07-31', 450, 0.60, 45, 'Antihistamine for allergies and hay fever', 'Drowsiness, dry mouth, fatigue', '10mg once daily', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-12', 'Insulin Glargine', 'Diabetes', 'Diabetes Solutions', 'INS2024001', '2025-05-31', 100, 25.00, 10, 'Long-acting insulin for diabetes management', 'Hypoglycemia, injection site reactions', 'As prescribed, usually once daily at bedtime', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-2', 'Metformin', 'Diabetes', 'Diabetes Solutions', 'MET2024001', '2025-06-30', 200, 2.50, 20, 'Diabetes medication to control blood sugar', 'May cause nausea, diarrhea', '500mg twice daily with meals', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-3', 'Amoxicillin', 'Antibiotic', 'MediPharm', 'AMO2024001', '2025-08-31', 300, 1.20, 30, 'Broad-spectrum antibiotic for bacterial infections', 'May cause allergic reactions, diarrhea', '500mg three times daily for 7 days', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-4', 'Lisinopril', 'Cardiovascular', 'CardioMed', 'LIS2024001', '2026-03-31', 250, 1.80, 25, 'ACE inhibitor for high blood pressure', 'Dizziness, dry cough, headache', '10mg once daily', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-5', 'Omeprazole', 'Gastrointestinal', 'GastroHealth', 'OME2024001', '2025-10-31', 400, 0.80, 40, 'Proton pump inhibitor for acid reflux and ulcers', 'Headache, nausea, abdominal pain', '20mg once daily before breakfast', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-6', 'Atorvastatin', 'Cardiovascular', 'CardioMed', 'ATO2024001', '2026-01-31', 350, 2.20, 35, 'Statin medication to lower cholesterol', 'Muscle pain, liver enzyme elevation', '20mg once daily in the evening', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-7', 'Ibuprofen', 'Pain Relief', 'Pharma Corp', 'IBU2024001', '2025-11-30', 600, 0.40, 60, 'NSAID for pain, fever, and inflammation', 'Stomach upset, heartburn, dizziness', '400mg every 4-6 hours as needed', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-8', 'Levothyroxine', 'Endocrine', 'EndoPharm', 'LEV2024001', '2026-02-28', 280, 1.50, 28, 'Thyroid hormone replacement', 'Heart palpitations if overdosed', '75mcg once daily on empty stomach', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460'),
('med-9', 'Azithromycin', 'Antibiotic', 'MediPharm', 'AZI2024001', '2025-09-30', 180, 3.50, 18, 'Macrolide antibiotic for respiratory infections', 'Nausea, diarrhea, stomach pain', '500mg on day 1, then 250mg daily for 4 days', '2025-10-04 09:07:14.460', '2025-10-04 09:07:14.460');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `emergency_contact` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `blood_group` enum('A+','A-','B+','B-','AB+','AB-','O+','O-') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medical_history` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive','discharged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `allergy_notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `patient_id`, `first_name`, `last_name`, `date_of_birth`, `gender`, `phone`, `address`, `emergency_contact`, `blood_group`, `medical_history`, `status`, `created_at`, `updated_at`, `allergy_notes`) VALUES
('67fe7667-8f35-4549-945a-f88d33079473', 'PAT003', 'Ahmed', 'Mohamed', '1978-12-10', 'male', '+1234567800', '789 Pine St, City, State', '+1234567801', 'B+', 'Hypertension', 'active', '2025-10-04 09:07:14.451', '2025-10-04 09:07:14.451', 'Shellfish'),
('9e867098-fb7a-4488-accc-fee5aeef2487', 'PAT001', 'John', 'Doe', '1985-05-15', 'male', '+1234567896', '123 Main St, City, State', '+1234567897', 'O+', 'No significant medical history', 'active', '2025-10-04 09:07:14.451', '2025-10-04 09:07:14.451', 'None known'),
('ecd4b81b-1559-443b-915a-3f2dc01023a3', 'PAT002', 'Jane', 'Smith', '1990-08-22', 'female', '+1234567898', '456 Oak Ave, City, State', '+1234567899', 'A+', 'Diabetes Type 2', 'active', '2025-10-04 09:07:14.451', '2025-10-04 09:07:14.451', 'Penicillin');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `resource` enum('PATIENT','DOCTOR','APPOINTMENT','MEDICAL_RECORD','PRESCRIPTION','LAB_TEST','BILLING','ADMISSION','USER','SETTINGS','REPORTS','PHARMACY','ALL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` enum('CREATE','READ','UPDATE','DELETE','EXECUTE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `resource`, `action`, `created_at`, `updated_at`) VALUES
('020d3a9b-edef-4a10-abdd-45f2fe07a6fd', 'Delete Billing', NULL, 'BILLING', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('0294c3fe-c540-4832-ac54-dee904e95f8b', 'Update Settings', NULL, 'SETTINGS', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('0436d8e2-cdfc-4c34-8949-7f508175558d', 'View Admission', NULL, 'ADMISSION', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('125fbb1c-2067-47c2-a8b6-c26a8964a903', 'View Doctor', NULL, 'DOCTOR', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('12ec8710-4f9e-42a8-a7c6-366fd244a6d3', 'Delete Patient', NULL, 'PATIENT', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('14261b90-11cb-43ed-93c9-7b750b46f5b3', 'Create Billing', NULL, 'BILLING', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('1b7477b3-ed49-42ad-b4de-d1a55177f0a8', 'Update User', NULL, 'USER', 'UPDATE', '2025-10-04 09:07:14.526', '2025-10-04 09:07:14.526'),
('1be2b295-3eda-451c-b8b5-24eb107f11d4', 'Delete Doctor', NULL, 'DOCTOR', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('1d3effa8-697b-4790-ae85-755acfcb6748', 'Create Appointment', NULL, 'APPOINTMENT', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('1e9429e3-fa42-4010-9b7c-22f6ccc3faed', 'View Report', NULL, 'REPORTS', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('28c186fb-ba95-4c70-9142-d9b7df441300', 'Update Prescription', NULL, 'PRESCRIPTION', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('32a76779-bdf8-4084-9f63-f0522d80ee77', 'View Patient', NULL, 'PATIENT', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('415a1409-c989-4e60-9944-d2e3e5e20dca', 'Create Admission', NULL, 'ADMISSION', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('4484ab6e-5eae-4dc7-a21c-c49031057b26', 'Delete Lab Test', NULL, 'LAB_TEST', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('452bf4b2-852f-42ed-88e5-1711526dff13', 'View Settings', NULL, 'SETTINGS', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('45c864af-e1cd-44dc-ba2c-f679aceb39a7', 'Create Pharmacy Record', NULL, 'PHARMACY', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('562c8ba9-dff6-490e-8aa8-4a2f1dc14447', 'Generate Report', NULL, 'REPORTS', 'EXECUTE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('5888a020-04ef-4046-ab7c-5b92b72009dd', 'View Billing', NULL, 'BILLING', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('5c8b1125-c670-4524-85e3-e6c47cdef18f', 'Create User', NULL, 'USER', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('684c2267-51f5-433b-98dc-e4256b4f5677', 'View Pharmacy Record', NULL, 'PHARMACY', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('71a41814-c84c-4ab6-bc4b-0dedc68065bc', 'View Prescription', NULL, 'PRESCRIPTION', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('74310ffa-b4b9-4fa4-a7b3-6a7e3387ec9c', 'Update Lab Test', NULL, 'LAB_TEST', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('7d1550ae-b0f9-471a-9c3c-6430d24a1991', 'Update Patient', NULL, 'PATIENT', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('7e1fb610-f9f3-4885-a355-8d3a227f2bdf', 'Delete Prescription', NULL, 'PRESCRIPTION', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('7f6c5587-d9b4-47dd-9006-79e3758f5863', 'Create Lab Test', NULL, 'LAB_TEST', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('87ca8a43-ab7b-4fd7-bd8d-9824dfa106ee', 'Create Doctor', NULL, 'DOCTOR', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('8d0a6496-30a7-44f5-9158-84f303516d8f', 'Update Pharmacy Record', NULL, 'PHARMACY', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('98c77c47-0054-409e-bda8-cb47bbb0c21a', 'Delete Medical Record', NULL, 'MEDICAL_RECORD', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('a14d4d00-34fa-471d-90f4-4ca07a2975a3', 'Delete Admission', NULL, 'ADMISSION', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('a97fa64f-6044-4e86-a169-c07d4fbecb1d', 'View Medical Record', NULL, 'MEDICAL_RECORD', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('ab37bc3f-02d0-44d6-a8a0-8ef86af154ca', 'Update Doctor', NULL, 'DOCTOR', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('b0d52d4f-b6c7-4b00-9415-35a175475871', 'Update Admission', NULL, 'ADMISSION', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('bbeaeb36-f937-4113-8f3d-1517b5681fd6', 'Create Patient', NULL, 'PATIENT', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('bd92b3e9-6903-4235-a2ac-d066f1ea35af', 'View User', NULL, 'USER', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('c6ff44f6-0882-41d7-ba7e-c1a30fd95bd4', 'Delete Pharmacy Record', NULL, 'PHARMACY', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('ca5fc6e6-2a95-4274-b454-27c08c5059f0', 'Create Prescription', NULL, 'PRESCRIPTION', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('d36a11fe-3b09-469c-997f-a3d092f2d1f5', 'View Appointment', NULL, 'APPOINTMENT', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('d935e909-c513-4605-9206-e260a4de380e', 'Update Medical Record', NULL, 'MEDICAL_RECORD', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('e0d2e719-c00d-45bf-aa6c-d318216233a1', 'Delete Appointment', NULL, 'APPOINTMENT', 'DELETE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('ea659f2b-5a05-463a-b9ec-fd1a5297c656', 'Create Medical Record', NULL, 'MEDICAL_RECORD', 'CREATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('f3c9ccb8-bd13-494c-9824-626836c2d36d', 'Delete User', NULL, 'USER', 'DELETE', '2025-10-04 09:07:14.526', '2025-10-04 09:07:14.526'),
('f80942c0-37ad-4935-a72f-1abcaeb37763', 'View Lab Test', NULL, 'LAB_TEST', 'READ', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('fbe12633-26a8-46cc-bd3d-3e8f810d7e14', 'Update Billing', NULL, 'BILLING', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525'),
('fc961686-dab4-4f5a-b101-9f6b25f01c8c', 'Update Appointment', NULL, 'APPOINTMENT', 'UPDATE', '2025-10-04 09:07:14.525', '2025-10-04 09:07:14.525');

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medicine_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_templates`
--

CREATE TABLE `report_templates` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` enum('PATIENT_SUMMARY','MEDICAL_HISTORY','PRESCRIPTION_REPORT','VITAL_SIGNS_REPORT','LAB_RESULTS_REPORT','ADMISSION_REPORT','FINANCIAL_REPORT','APPOINTMENT_REPORT','DIAGNOSIS_REPORT','CUSTOM_REPORT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `defaultFormat` enum('PDF','CSV','EXCEL','JSON') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PDF',
  `templateConfig` json NOT NULL,
  `defaultParams` json DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `report_templates`
--

INSERT INTO `report_templates` (`id`, `name`, `description`, `type`, `defaultFormat`, `templateConfig`, `defaultParams`, `is_public`, `created_by`, `is_active`, `created_at`, `updated_at`) VALUES
('8f449803-776b-4d49-8f9a-e81367f24ea8', 'Standard Patient Summary', 'Comprehensive patient overview template including demographics, medical history, and recent activities', 'PATIENT_SUMMARY', 'PDF', '{\"sections\": [\"demographics\", \"medical_history\", \"current_medications\", \"recent_appointments\", \"lab_results\"], \"formatting\": {\"pageSize\": \"A4\", \"includeLogo\": true, \"orientation\": \"portrait\", \"includeSignature\": true}}', NULL, 0, '435098b9-1a98-401a-a3f1-2365a4424824', 1, '2025-10-04 09:07:14.521', '2025-10-04 09:07:14.521'),
('f8c3fea6-7693-4634-a39e-2a78254a22a9', 'Monthly Prescription Analysis', 'Template for analyzing prescription patterns and drug utilization', 'PRESCRIPTION_REPORT', 'PDF', '{\"groupBy\": [\"doctor\", \"medication_type\", \"department\"], \"sections\": [\"prescription_summary\", \"drug_categories\", \"prescriber_analysis\", \"patient_adherence\"], \"chartTypes\": [\"bar\", \"pie\", \"trend\"]}', NULL, 0, '1fae546b-ae57-4986-8b5e-5a9701adbe07', 1, '2025-10-04 09:07:14.522', '2025-10-04 09:07:14.522');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `is_system`, `created_at`, `updated_at`) VALUES
('2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'Nurse', 'Nurse access to patient care and medical records', 1, '2025-10-04 09:07:14.558', '2025-10-04 09:07:14.558'),
('5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'Admin', 'Full system access', 1, '2025-10-04 09:07:14.535', '2025-10-04 09:07:14.535'),
('5fd5d176-ff86-459c-9920-274781f4116d', 'Receptionist', 'Receptionist access to appointments and billing', 1, '2025-10-04 09:07:14.561', '2025-10-04 09:07:14.561'),
('e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'Doctor', 'Doctor access to medical records and patient care', 1, '2025-10-04 09:07:14.551', '2025-10-04 09:07:14.551');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`, `created_at`) VALUES
('0085b2f5-7c98-48ce-9c98-bcac88c9d0db', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '562c8ba9-dff6-490e-8aa8-4a2f1dc14447', '2025-10-04 09:07:14.553'),
('0232dd92-1463-4ddf-9ffe-38f48ffac473', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'd36a11fe-3b09-469c-997f-a3d092f2d1f5', '2025-10-04 09:07:14.553'),
('043f21c6-6626-449d-b743-da8ee943ee17', '5fd5d176-ff86-459c-9920-274781f4116d', 'e0d2e719-c00d-45bf-aa6c-d318216233a1', '2025-10-04 09:07:14.563'),
('07fd1092-fc8b-47f9-956f-7245668fb563', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '87ca8a43-ab7b-4fd7-bd8d-9824dfa106ee', '2025-10-04 09:07:14.540'),
('082d47b3-8c39-4ec3-9032-e160ba5383d8', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '020d3a9b-edef-4a10-abdd-45f2fe07a6fd', '2025-10-04 09:07:14.540'),
('08f00d30-acee-41c1-a9a3-1ce0681ba266', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'ca5fc6e6-2a95-4274-b454-27c08c5059f0', '2025-10-04 09:07:14.540'),
('0bfcb77c-b303-4c03-8b35-a1fb05050ac6', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'fc961686-dab4-4f5a-b101-9f6b25f01c8c', '2025-10-04 09:07:14.553'),
('0de1b5ff-85c0-490a-a0ed-4b97df6f22e9', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'bd92b3e9-6903-4235-a2ac-d066f1ea35af', '2025-10-04 09:07:14.540'),
('0f94c81d-8a38-4dd4-b891-a7738dd37c7a', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'c6ff44f6-0882-41d7-ba7e-c1a30fd95bd4', '2025-10-04 09:07:14.553'),
('1228b04c-2096-43b0-9089-2688ee914bbf', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '14261b90-11cb-43ed-93c9-7b750b46f5b3', '2025-10-04 09:07:14.540'),
('124aa285-9a1c-4b98-bbfc-316a8b524667', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '5888a020-04ef-4046-ab7c-5b92b72009dd', '2025-10-04 09:07:14.540'),
('12a7788f-6974-49c3-9c35-189278c53539', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '71a41814-c84c-4ab6-bc4b-0dedc68065bc', '2025-10-04 09:07:14.559'),
('1408ba2a-7401-4563-a314-110d7de51b2c', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '8d0a6496-30a7-44f5-9158-84f303516d8f', '2025-10-04 09:07:14.553'),
('168dd036-4fde-4a72-928d-13e2b67e85ba', '5fd5d176-ff86-459c-9920-274781f4116d', 'fbe12633-26a8-46cc-bd3d-3e8f810d7e14', '2025-10-04 09:07:14.563'),
('192748e2-9b72-41ee-9519-75bc6139ac05', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'ea659f2b-5a05-463a-b9ec-fd1a5297c656', '2025-10-04 09:07:14.540'),
('24e574b2-be4a-41ac-b008-79dd389a0b80', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '684c2267-51f5-433b-98dc-e4256b4f5677', '2025-10-04 09:07:14.559'),
('26a3944d-7fd2-4ee6-aaa2-5ac53407ca33', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'bbeaeb36-f937-4113-8f3d-1517b5681fd6', '2025-10-04 09:07:14.553'),
('282ba3dd-1b6f-4daf-95b1-68afb177f602', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '74310ffa-b4b9-4fa4-a7b3-6a7e3387ec9c', '2025-10-04 09:07:14.540'),
('2b0f5afb-ec2b-43ed-a89e-14092c96a9f4', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '7d1550ae-b0f9-471a-9c3c-6430d24a1991', '2025-10-04 09:07:14.539'),
('2d6b0acb-d821-45b5-9a73-6869ef7fbc4d', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '0294c3fe-c540-4832-ac54-dee904e95f8b', '2025-10-04 09:07:14.540'),
('2f290945-3432-47d0-968b-d08dc4a7b72c', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '12ec8710-4f9e-42a8-a7c6-366fd244a6d3', '2025-10-04 09:07:14.553'),
('39965a41-62ec-439f-86c8-58139139341e', '5fd5d176-ff86-459c-9920-274781f4116d', '1d3effa8-697b-4790-ae85-755acfcb6748', '2025-10-04 09:07:14.563'),
('3c507439-8137-40be-bc83-9bdf671dc8cd', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'd935e909-c513-4605-9206-e260a4de380e', '2025-10-04 09:07:14.559'),
('3d80dcbb-44c9-4ed5-9d70-30810347e204', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'a97fa64f-6044-4e86-a169-c07d4fbecb1d', '2025-10-04 09:07:14.553'),
('3ed0c5f4-9677-469a-bfde-f065d28e5235', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '74310ffa-b4b9-4fa4-a7b3-6a7e3387ec9c', '2025-10-04 09:07:14.559'),
('442793b1-3ab2-479d-82a3-5f8027d3244e', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'a14d4d00-34fa-471d-90f4-4ca07a2975a3', '2025-10-04 09:07:14.553'),
('457056a5-6cf3-40e4-a04b-3aeac62040df', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'ab37bc3f-02d0-44d6-a8a0-8ef86af154ca', '2025-10-04 09:07:14.539'),
('4aee1d46-ba6b-4837-9faa-f17549423011', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '452bf4b2-852f-42ed-88e5-1711526dff13', '2025-10-04 09:07:14.540'),
('4b07bafc-1108-4325-9faa-fb68fbc4c70b', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'f3c9ccb8-bd13-494c-9824-626836c2d36d', '2025-10-04 09:07:14.540'),
('4c20dd54-795d-475b-9ec2-80558305485c', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '7f6c5587-d9b4-47dd-9006-79e3758f5863', '2025-10-04 09:07:14.553'),
('4ca56171-ed62-45a4-9515-ef55977e6857', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'a14d4d00-34fa-471d-90f4-4ca07a2975a3', '2025-10-04 09:07:14.540'),
('53c4bb35-fafc-42cc-9780-113830fcae59', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'f80942c0-37ad-4935-a72f-1abcaeb37763', '2025-10-04 09:07:14.559'),
('54ea9c05-527e-4f32-979c-69b0a9a014d4', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'f80942c0-37ad-4935-a72f-1abcaeb37763', '2025-10-04 09:07:14.553'),
('63fc4f4e-9b67-445f-8601-2834913a4a45', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'c6ff44f6-0882-41d7-ba7e-c1a30fd95bd4', '2025-10-04 09:07:14.540'),
('674a097f-91a7-46c4-bdd7-7d53645f5edd', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'e0d2e719-c00d-45bf-aa6c-d318216233a1', '2025-10-04 09:07:14.553'),
('6cbfce28-490e-437e-91f6-47a58f5ddc51', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '125fbb1c-2067-47c2-a8b6-c26a8964a903', '2025-10-04 09:07:14.553'),
('7204aa44-9ce7-477e-bfc5-26f90c67065a', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '32a76779-bdf8-4084-9f63-f0522d80ee77', '2025-10-04 09:07:14.559'),
('732076eb-bdb4-41fe-a7a3-8497bd3d47c1', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'ca5fc6e6-2a95-4274-b454-27c08c5059f0', '2025-10-04 09:07:14.553'),
('76e506ad-c050-400d-8cef-57a12fe7755b', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'f80942c0-37ad-4935-a72f-1abcaeb37763', '2025-10-04 09:07:14.540'),
('771286d0-39c8-4395-81d7-6b88fd50faad', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'd935e909-c513-4605-9206-e260a4de380e', '2025-10-04 09:07:14.553'),
('78a08180-9df0-4144-a4ed-42ea8d2a2abe', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '125fbb1c-2067-47c2-a8b6-c26a8964a903', '2025-10-04 09:07:14.540'),
('7f81ebc9-e2e1-49a1-8c05-00eba6fd3713', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '7d1550ae-b0f9-471a-9c3c-6430d24a1991', '2025-10-04 09:07:14.559'),
('80faad91-5849-428a-8003-7392a21e26ae', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'a97fa64f-6044-4e86-a169-c07d4fbecb1d', '2025-10-04 09:07:14.559'),
('821f60ff-eec6-4b2b-825d-6943ef03a124', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '71a41814-c84c-4ab6-bc4b-0dedc68065bc', '2025-10-04 09:07:14.553'),
('8d39dfe6-03b0-43c4-a7ac-9f396966784b', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '7e1fb610-f9f3-4885-a355-8d3a227f2bdf', '2025-10-04 09:07:14.553'),
('8ebb44e0-9e8c-42d3-b461-d93182fc1373', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '4484ab6e-5eae-4dc7-a21c-c49031057b26', '2025-10-04 09:07:14.553'),
('8f0831c2-3648-4e35-b20b-11192ca9d8a6', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'b0d52d4f-b6c7-4b00-9415-35a175475871', '2025-10-04 09:07:14.559'),
('8f5d0536-29a8-40aa-b39a-5ce525b1e599', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'b0d52d4f-b6c7-4b00-9415-35a175475871', '2025-10-04 09:07:14.540'),
('902935bb-28de-49bc-839f-e09726f967e4', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '74310ffa-b4b9-4fa4-a7b3-6a7e3387ec9c', '2025-10-04 09:07:14.553'),
('91af95c4-a2e6-4250-a7eb-724dc0d4b3a6', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'bbeaeb36-f937-4113-8f3d-1517b5681fd6', '2025-10-04 09:07:14.539'),
('9429d37f-27b5-4f11-af31-ce56bfa804b2', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '684c2267-51f5-433b-98dc-e4256b4f5677', '2025-10-04 09:07:14.553'),
('98982f4a-8688-4d72-b1dc-fe5d04514457', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '415a1409-c989-4e60-9944-d2e3e5e20dca', '2025-10-04 09:07:14.540'),
('99abe0b7-9a62-480d-89d0-c7a62a50289a', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'd36a11fe-3b09-469c-997f-a3d092f2d1f5', '2025-10-04 09:07:14.539'),
('9d664dbb-269d-4d86-aff8-f1fb98215577', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '7e1fb610-f9f3-4885-a355-8d3a227f2bdf', '2025-10-04 09:07:14.539'),
('a1afd7dc-ff0b-4aed-bec7-7e7d22475199', '5fd5d176-ff86-459c-9920-274781f4116d', '32a76779-bdf8-4084-9f63-f0522d80ee77', '2025-10-04 09:07:14.563'),
('a4b6752b-f49d-45c9-9981-3b64e970d0e3', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '0436d8e2-cdfc-4c34-8949-7f508175558d', '2025-10-04 09:07:14.540'),
('a5be8d33-3c4d-420f-8de5-13332dd9ec0e', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '32a76779-bdf8-4084-9f63-f0522d80ee77', '2025-10-04 09:07:14.539'),
('a91ab2a6-81f2-458f-928b-930debd5abd9', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '1d3effa8-697b-4790-ae85-755acfcb6748', '2025-10-04 09:07:14.540'),
('a9b2e04c-4a37-417d-849a-82af535b65cb', '5fd5d176-ff86-459c-9920-274781f4116d', '5888a020-04ef-4046-ab7c-5b92b72009dd', '2025-10-04 09:07:14.563'),
('aacf500a-e029-4a0a-a9c8-11ad19c538b5', '5fd5d176-ff86-459c-9920-274781f4116d', '7d1550ae-b0f9-471a-9c3c-6430d24a1991', '2025-10-04 09:07:14.563'),
('ade85c4c-d500-4af2-85a6-2d8b714f5b3f', '5fd5d176-ff86-459c-9920-274781f4116d', 'd36a11fe-3b09-469c-997f-a3d092f2d1f5', '2025-10-04 09:07:14.563'),
('adf0b875-7c6c-4b7d-b531-1fda72e64648', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'd935e909-c513-4605-9206-e260a4de380e', '2025-10-04 09:07:14.539'),
('af241be7-72c5-4b0c-a7ab-e204fe945538', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '45c864af-e1cd-44dc-ba2c-f679aceb39a7', '2025-10-04 09:07:14.553'),
('b0ae6ac3-2aed-4cca-93da-f2cb341bcb6a', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '7f6c5587-d9b4-47dd-9006-79e3758f5863', '2025-10-04 09:07:14.540'),
('b2b54a2c-58c1-481e-a23d-9bf8a758e19c', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '0436d8e2-cdfc-4c34-8949-7f508175558d', '2025-10-04 09:07:14.559'),
('b2bccbb2-eb52-4e1f-899b-c144f73573d4', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'b0d52d4f-b6c7-4b00-9415-35a175475871', '2025-10-04 09:07:14.553'),
('b4f404e8-6c73-4667-be5e-2a585b409c2e', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '98c77c47-0054-409e-bda8-cb47bbb0c21a', '2025-10-04 09:07:14.539'),
('b58f31f1-8915-4bca-a79b-ac0a36aa5b36', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '415a1409-c989-4e60-9944-d2e3e5e20dca', '2025-10-04 09:07:14.553'),
('b9582c6b-6f15-4462-a05a-98000fcc4066', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '28c186fb-ba95-4c70-9142-d9b7df441300', '2025-10-04 09:07:14.553'),
('ba2c8c43-cc6b-45d3-88e6-3f11286c1afe', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '8d0a6496-30a7-44f5-9158-84f303516d8f', '2025-10-04 09:07:14.540'),
('ba54f403-5235-4c9b-a26b-6fa367a0df3c', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '32a76779-bdf8-4084-9f63-f0522d80ee77', '2025-10-04 09:07:14.553'),
('bd0d2dae-00da-4797-b483-1ce94e71e3db', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '1e9429e3-fa42-4010-9b7c-22f6ccc3faed', '2025-10-04 09:07:14.540'),
('bd190d00-6676-4128-acde-37332696ced1', '5fd5d176-ff86-459c-9920-274781f4116d', '020d3a9b-edef-4a10-abdd-45f2fe07a6fd', '2025-10-04 09:07:14.563'),
('bf31211f-1244-43dc-b4d2-c69eea9ed92b', '5fd5d176-ff86-459c-9920-274781f4116d', 'bbeaeb36-f937-4113-8f3d-1517b5681fd6', '2025-10-04 09:07:14.563'),
('c6321fd6-9509-4f7a-891e-e896e66285c6', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', 'ea659f2b-5a05-463a-b9ec-fd1a5297c656', '2025-10-04 09:07:14.553'),
('c8947f70-0f35-495b-9e04-5444f233703d', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '71a41814-c84c-4ab6-bc4b-0dedc68065bc', '2025-10-04 09:07:14.540'),
('c9d4c47d-497c-4d34-bbca-e06a12a39ea8', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'e0d2e719-c00d-45bf-aa6c-d318216233a1', '2025-10-04 09:07:14.539'),
('cb490382-ed6d-4a63-b725-bbf9ca4e2e8d', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '0436d8e2-cdfc-4c34-8949-7f508175558d', '2025-10-04 09:07:14.553'),
('cda580a6-792f-485f-aa73-826097c0e13e', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'fbe12633-26a8-46cc-bd3d-3e8f810d7e14', '2025-10-04 09:07:14.540'),
('cf2ca12f-8f9a-4eaf-a951-ab731920fd9b', '5fd5d176-ff86-459c-9920-274781f4116d', '125fbb1c-2067-47c2-a8b6-c26a8964a903', '2025-10-04 09:07:14.563'),
('d0645863-e679-4ce8-b1a2-5c5b23532e85', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '1be2b295-3eda-451c-b8b5-24eb107f11d4', '2025-10-04 09:07:14.540'),
('d118002a-50e1-4e28-ba52-67e901c80a09', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '1b7477b3-ed49-42ad-b4de-d1a55177f0a8', '2025-10-04 09:07:14.540'),
('d2cad3f2-bf2c-451a-9fbd-bb95b7f07b3c', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '28c186fb-ba95-4c70-9142-d9b7df441300', '2025-10-04 09:07:14.559'),
('d71e3cdc-507a-4c30-bf3c-c00bf0d6088e', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '125fbb1c-2067-47c2-a8b6-c26a8964a903', '2025-10-04 09:07:14.559'),
('da8b2de0-ed98-45de-97f7-617f003df001', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '684c2267-51f5-433b-98dc-e4256b4f5677', '2025-10-04 09:07:14.540'),
('dcd0a5f9-0aaa-4a01-bb11-2c06ae24725b', '5fd5d176-ff86-459c-9920-274781f4116d', '14261b90-11cb-43ed-93c9-7b750b46f5b3', '2025-10-04 09:07:14.563'),
('de33f93f-9992-49d3-a5b2-d7fd0a87fa05', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '98c77c47-0054-409e-bda8-cb47bbb0c21a', '2025-10-04 09:07:14.553'),
('e04aaf63-05a9-46d1-b74d-2e574af27945', '5fd5d176-ff86-459c-9920-274781f4116d', '12ec8710-4f9e-42a8-a7c6-366fd244a6d3', '2025-10-04 09:07:14.563'),
('e0f691a0-f163-481f-b7c2-cdbdd1d31079', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', '8d0a6496-30a7-44f5-9158-84f303516d8f', '2025-10-04 09:07:14.559'),
('e6dfa215-1b39-4f10-9ce5-b16ce8ea8773', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '12ec8710-4f9e-42a8-a7c6-366fd244a6d3', '2025-10-04 09:07:14.539'),
('eb9975af-7b6e-4f8b-9476-cd4b2a146809', '5fd5d176-ff86-459c-9920-274781f4116d', 'fc961686-dab4-4f5a-b101-9f6b25f01c8c', '2025-10-04 09:07:14.563'),
('eb9c972d-31d2-4e02-8d4a-4845b24d5572', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '4484ab6e-5eae-4dc7-a21c-c49031057b26', '2025-10-04 09:07:14.539'),
('f08be2ca-19ab-4bf4-bb09-e40209ebf35a', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '5c8b1125-c670-4524-85e3-e6c47cdef18f', '2025-10-04 09:07:14.540'),
('f1040fd5-ea34-4851-ba34-1608992790a0', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '45c864af-e1cd-44dc-ba2c-f679aceb39a7', '2025-10-04 09:07:14.540'),
('f461e70a-47a0-46dc-80b6-2b5ae3b09c38', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '562c8ba9-dff6-490e-8aa8-4a2f1dc14447', '2025-10-04 09:07:14.540'),
('f4d7bcdf-867d-4b12-a622-ce764e21ea30', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'd36a11fe-3b09-469c-997f-a3d092f2d1f5', '2025-10-04 09:07:14.559'),
('f73ab230-5f8e-4ba5-8886-4c4537423d66', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'fc961686-dab4-4f5a-b101-9f6b25f01c8c', '2025-10-04 09:07:14.539'),
('fa85afa1-1ac4-4427-9043-c585945bfd5f', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', '28c186fb-ba95-4c70-9142-d9b7df441300', '2025-10-04 09:07:14.540'),
('fd9effde-ab07-4fb0-be5b-962160423dd4', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '1e9429e3-fa42-4010-9b7c-22f6ccc3faed', '2025-10-04 09:07:14.553'),
('fed09670-70aa-4743-b088-c0b24b10c192', '2e89c371-7a8e-4b1a-b885-5fe58a4d9dab', 'fc961686-dab4-4f5a-b101-9f6b25f01c8c', '2025-10-04 09:07:14.559'),
('feda22ad-fcc3-4101-96dd-74a26436717b', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '1d3effa8-697b-4790-ae85-755acfcb6748', '2025-10-04 09:07:14.553'),
('fef36765-387b-464c-9757-80673c4fbea4', 'e27f739a-a78d-49b4-9feb-4fa5f96b0288', '7d1550ae-b0f9-471a-9c3c-6430d24a1991', '2025-10-04 09:07:14.553'),
('ffadb1a1-51ad-4d04-b935-f1d4c9d878c0', '5de2f061-ca71-41f0-b74f-7e08eeced9ef', 'a97fa64f-6044-4e86-a169-c07d4fbecb1d', '2025-10-04 09:07:14.540');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('SYSTEM','USER','HOSPITAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatments`
--

CREATE TABLE `treatments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnosis_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','DISCONTINUED','ON_HOLD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatment_goals`
--

CREATE TABLE `treatment_goals` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `target_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_date` datetime(3) DEFAULT NULL,
  `achieved_date` datetime(3) DEFAULT NULL,
  `status` enum('NOT_STARTED','IN_PROGRESS','ACHIEVED','PARTIALLY_ACHIEVED','NOT_ACHIEVED','DISCONTINUED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_STARTED',
  `progress` int NOT NULL DEFAULT '0',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `treatment_plan_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_to` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatment_plans`
--

CREATE TABLE `treatment_plans` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `diagnosis` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) DEFAULT NULL,
  `review_date` datetime(3) DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','PAUSED','CANCELLED','DRAFT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `overall_progress` int NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `objectives` json DEFAULT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doctor_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_by` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatment_progress`
--

CREATE TABLE `treatment_progress` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime(3) NOT NULL,
  `progress_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `observations` text COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `treatment_plan_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `task_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatment_reviews`
--

CREATE TABLE `treatment_reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_date` datetime(3) NOT NULL,
  `review_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `overall_assessment` text COLLATE utf8mb4_unicode_ci,
  `progress_summary` text COLLATE utf8mb4_unicode_ci,
  `goals_assessment` json DEFAULT NULL,
  `recommendations` text COLLATE utf8mb4_unicode_ci,
  `adjustments` text COLLATE utf8mb4_unicode_ci,
  `next_steps` text COLLATE utf8mb4_unicode_ci,
  `next_review_date` datetime(3) DEFAULT NULL,
  `status_before` enum('ACTIVE','COMPLETED','PAUSED','CANCELLED','DRAFT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_after` enum('ACTIVE','COMPLETED','PAUSED','CANCELLED','DRAFT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment_plan_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewed_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `treatment_tasks`
--

CREATE TABLE `treatment_tasks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `due_date` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `estimated_duration` int DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','OVERDUE','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `task_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `progress` int NOT NULL DEFAULT '0',
  `completion_notes` text COLLATE utf8mb4_unicode_ci,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurrence_pattern` json DEFAULT NULL,
  `treatment_plan_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `goal_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','doctor','nurse','receptionist') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `last_login` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `phone`, `department`, `employee_id`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
('1fae546b-ae57-4986-8b5e-5a9701adbe07', 'Doctor User', 'doctor@medicore.com', '$2b$10$wltbOWbivfbU2xrpXFyLlORjSbCWgVMszW0N0lrKTJ2YXrN2tITGK', 'doctor', '+1234567891', 'Cardiology', 'DOC001', 'active', NULL, '2025-10-04 09:07:14.431', '2025-10-04 09:07:14.431'),
('435098b9-1a98-401a-a3f1-2365a4424824', 'Admin User', 'admin@medicore.com', '$2b$10$wltbOWbivfbU2xrpXFyLlORjSbCWgVMszW0N0lrKTJ2YXrN2tITGK', 'admin', '+1234567890', 'Administration', 'ADM001', 'active', '2025-10-04 09:08:58.610', '2025-10-04 09:07:14.424', '2025-10-04 09:08:58.611'),
('9733f939-5128-4c51-a602-c6b865fa2c49', 'Nurse User', 'nurse@medicore.com', '$2b$10$wltbOWbivfbU2xrpXFyLlORjSbCWgVMszW0N0lrKTJ2YXrN2tITGK', 'nurse', '+1234567892', 'Emergency', 'NUR001', 'active', NULL, '2025-10-04 09:07:14.433', '2025-10-04 09:07:14.433'),
('e238d05b-1a2b-40e5-9ae6-d14fd1328e50', 'Receptionist User', 'receptionist@medicore.com', '$2b$10$wltbOWbivfbU2xrpXFyLlORjSbCWgVMszW0N0lrKTJ2YXrN2tITGK', 'receptionist', '+1234567893', 'Reception', 'REC001', 'active', NULL, '2025-10-04 09:07:14.435', '2025-10-04 09:07:14.435');

-- --------------------------------------------------------

--
-- Table structure for table `user_groups`
--

CREATE TABLE `user_groups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vital_signs`
--

CREATE TABLE `vital_signs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `medical_record_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('BLOOD_PRESSURE','HEART_RATE','TEMPERATURE','RESPIRATORY_RATE','OXYGEN_SATURATION','WEIGHT','HEIGHT','BMI','PAIN_SCALE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `normal_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_abnormal` tinyint(1) NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `measured_by` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `measured_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vital_signs`
--

INSERT INTO `vital_signs` (`id`, `patient_id`, `medical_record_id`, `type`, `value`, `unit`, `normal_range`, `is_abnormal`, `notes`, `measured_by`, `measured_at`, `created_at`) VALUES
('1034ecd5-760c-4a6f-954c-11cc8dea49c2', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', NULL, 'PAIN_SCALE', '3', '/10', '0-3 (mild)', 0, 'Mild discomfort at catheter site', 'Dr. Ali', '2024-12-22 07:15:00.000', '2025-10-04 09:07:14.504'),
('19e82a92-820a-4fd0-a5c8-f22614ae3828', '9e867098-fb7a-4488-accc-fee5aeef2487', NULL, 'BLOOD_PRESSURE', '140/90', 'mmHg', '90-140 / 60-90 mmHg', 1, 'Slightly elevated blood pressure, monitor closely', 'Nurse Sarah', '2024-12-20 05:30:00.000', '2025-10-04 09:07:14.497'),
('296c7ac6-dd26-40f7-a62d-828248c5ef33', '67fe7667-8f35-4549-945a-f88d33079473', NULL, 'HEART_RATE', '88', 'bpm', '60-100 bpm', 0, 'Normal maternal heart rate', 'Midwife Emma', '2024-12-25 11:20:00.000', '2025-10-04 09:07:14.506'),
('3571ff08-0171-44eb-8d56-8f2323803c18', '9e867098-fb7a-4488-accc-fee5aeef2487', NULL, 'HEART_RATE', '85', 'bpm', '60-100 bpm', 0, 'Regular rhythm', 'Nurse Sarah', '2024-12-20 05:30:00.000', '2025-10-04 09:07:14.499'),
('721d7a18-f41c-421e-b205-72228e3bd01f', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', NULL, 'BLOOD_PRESSURE', '120/80', 'mmHg', '90-140 / 60-90 mmHg', 0, 'Optimal blood pressure', 'Dr. Ali', '2024-12-22 07:15:00.000', '2025-10-04 09:07:14.502'),
('a193b1cf-26ad-41bd-931e-ce3b5473e5fb', '67fe7667-8f35-4549-945a-f88d33079473', NULL, 'BLOOD_PRESSURE', '110/70', 'mmHg', '90-140 / 60-90 mmHg', 0, 'Normal for pregnancy stage', 'Midwife Emma', '2024-12-25 11:20:00.000', '2025-10-04 09:07:14.505'),
('b0b1fb94-e34d-45cd-b1d2-ce9ab731aeca', '9e867098-fb7a-4488-accc-fee5aeef2487', NULL, 'TEMPERATURE', '38.2', '°C', '36.0-37.5°C', 1, 'Fever present, started on antipyretics', 'Nurse Sarah', '2024-12-20 05:30:00.000', '2025-10-04 09:07:14.500'),
('f5b07d98-76dd-4906-b3ca-8b54f5a39d04', '9e867098-fb7a-4488-accc-fee5aeef2487', NULL, 'OXYGEN_SATURATION', '96', '%', '95-100%', 0, 'Normal oxygen saturation on room air', 'Nurse Sarah', '2024-12-20 05:30:00.000', '2025-10-04 09:07:14.501'),
('f5f87b25-2632-42b7-9b64-5effade1dfa1', 'ecd4b81b-1559-443b-915a-3f2dc01023a3', NULL, 'HEART_RATE', '72', 'bpm', '60-100 bpm', 0, 'Post-procedure monitoring - stable rhythm', 'Dr. Ali', '2024-12-22 07:15:00.000', '2025-10-04 09:07:14.503'),
('f8b13ebb-6c3e-46d6-8fd2-12f29257f08a', '67fe7667-8f35-4549-945a-f88d33079473', NULL, 'WEIGHT', '78', 'kg', 'Variable', 0, 'Appropriate weight gain for gestational age', 'Midwife Emma', '2024-12-25 11:20:00.000', '2025-10-04 09:07:14.507');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1179964c-18c9-4b02-a254-8d884af03f00', '3bc0baf79388d905f52799e9d6d3707728fcc824a8f30d7a647ac6157815cf87', '2025-10-04 09:07:10.170', '20250928103526_add_medical_reports_system', NULL, NULL, '2025-10-04 09:07:10.112', 1),
('1e7cb724-54bb-45a4-83a8-952fabc58a80', '347fd03dda14ba1c736b95e6796dce0c27c4b7751510229509d0f3fea65320b4', '2025-10-04 09:07:10.622', '20251004084201_add_permissions_and_groups_system', NULL, NULL, '2025-10-04 09:07:10.507', 1),
('4c3a0d8e-5e92-4b68-8895-b8f996d4e153', 'e24c60f5e48e20b9f992837e29107d64dbbb5799adeaa2a3ae8af726e412f6e5', '2025-10-04 09:07:10.111', '20250927100226_add_lab_results_system', NULL, NULL, '2025-10-04 09:07:10.011', 1),
('65186a35-a066-444a-b175-9b5aa50aad37', '847e1609facb92621a8d71b0066fa138b5d417b0db3c5f5052d91598573a5a01', '2025-10-04 09:07:10.507', '20251003230856_add_settings_table', NULL, NULL, '2025-10-04 09:07:10.171', 1),
('ad822e00-44c6-44a5-97de-663e1de6bdc5', 'a12b5780a2aaf171f20c00d4a734e837352bf7c630f7743d20181f9b09bcdc60', '2025-10-04 09:07:09.643', '20250922225420_init', NULL, NULL, '2025-10-04 09:07:09.468', 1),
('c9628f09-92d4-463c-b34d-fc4eb4af79d0', '3f542115eba61d93b3d07adcaeb4e10a80d11eeb596c5bd41fb217eb567b9f46', '2025-10-04 09:07:09.903', '20250925092100_add_allergy_notes_field', NULL, NULL, '2025-10-04 09:07:09.644', 1),
('e69cbb71-6b4d-4146-93d5-eb15c3880cf0', '1f3d3e3e78cd4b9235afa107c2229cc724d0ada74b383a1e1065c6b2e14cb20d', '2025-10-04 09:07:10.011', '20250927095532_add_medical_templates', NULL, NULL, '2025-10-04 09:07:09.904', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admissions`
--
ALTER TABLE `admissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admissions_admission_date_idx` (`admission_date`),
  ADD KEY `admissions_ward_idx` (`ward`),
  ADD KEY `admissions_status_idx` (`status`),
  ADD KEY `admissions_patient_id_fkey` (`patient_id`),
  ADD KEY `admissions_doctor_id_fkey` (`doctor_id`);

--
-- Indexes for table `allergies`
--
ALTER TABLE `allergies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `allergies_patient_id_idx` (`patient_id`),
  ADD KEY `allergies_category_idx` (`category`),
  ADD KEY `allergies_severity_idx` (`severity`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appointments_appointment_date_idx` (`appointment_date`),
  ADD KEY `appointments_status_idx` (`status`),
  ADD KEY `appointments_patient_id_fkey` (`patient_id`),
  ADD KEY `appointments_doctor_id_fkey` (`doctor_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_idx` (`user_id`),
  ADD KEY `audit_logs_action_idx` (`action`),
  ADD KEY `audit_logs_entity_idx` (`entity`),
  ADD KEY `audit_logs_created_at_idx` (`created_at`);

--
-- Indexes for table `bills`
--
ALTER TABLE `bills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bills_invoice_number_key` (`invoice_number`),
  ADD KEY `bills_invoice_number_idx` (`invoice_number`),
  ADD KEY `bills_payment_status_idx` (`payment_status`),
  ADD KEY `bills_patient_id_fkey` (`patient_id`);

--
-- Indexes for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bill_items_bill_id_fkey` (`bill_id`);

--
-- Indexes for table `diagnoses`
--
ALTER TABLE `diagnoses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `diagnoses_medical_record_id_idx` (`medical_record_id`),
  ADD KEY `diagnoses_icd10_code_idx` (`icd10_code`),
  ADD KEY `diagnoses_type_idx` (`type`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `doctors_doctor_id_key` (`doctor_id`),
  ADD UNIQUE KEY `doctors_email_key` (`email`),
  ADD UNIQUE KEY `doctors_license_number_key` (`license_number`),
  ADD KEY `doctors_doctor_id_idx` (`doctor_id`),
  ADD KEY `doctors_specialization_idx` (`specialization`),
  ADD KEY `doctors_status_idx` (`status`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `groups_name_key` (`name`),
  ADD KEY `groups_name_idx` (`name`);

--
-- Indexes for table `group_permissions`
--
ALTER TABLE `group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_permissions_group_id_permission_id_key` (`group_id`,`permission_id`),
  ADD KEY `group_permissions_group_id_idx` (`group_id`),
  ADD KEY `group_permissions_permission_id_idx` (`permission_id`);

--
-- Indexes for table `immunizations`
--
ALTER TABLE `immunizations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `immunizations_patient_id_idx` (`patient_id`),
  ADD KEY `immunizations_vaccine_name_idx` (`vaccine_name`),
  ADD KEY `immunizations_status_idx` (`status`),
  ADD KEY `immunizations_scheduled_date_idx` (`scheduled_date`);

--
-- Indexes for table `lab_panels`
--
ALTER TABLE `lab_panels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_panels_category_idx` (`category`),
  ADD KEY `lab_panels_is_active_idx` (`is_active`);

--
-- Indexes for table `lab_panel_tests`
--
ALTER TABLE `lab_panel_tests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_panel_tests_panel_id_parameter_id_key` (`panel_id`,`parameter_id`),
  ADD KEY `lab_panel_tests_parameter_id_fkey` (`parameter_id`);

--
-- Indexes for table `lab_parameters`
--
ALTER TABLE `lab_parameters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_parameters_code_key` (`code`),
  ADD KEY `lab_parameters_code_idx` (`code`),
  ADD KEY `lab_parameters_category_idx` (`category`),
  ADD KEY `lab_parameters_is_active_idx` (`is_active`);

--
-- Indexes for table `lab_reference_ranges`
--
ALTER TABLE `lab_reference_ranges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_reference_ranges_parameter_id_idx` (`parameter_id`),
  ADD KEY `lab_reference_ranges_gender_idx` (`gender`),
  ADD KEY `lab_reference_ranges_age_min_age_max_idx` (`age_min`,`age_max`);

--
-- Indexes for table `lab_results`
--
ALTER TABLE `lab_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lab_results_lab_test_id_idx` (`lab_test_id`),
  ADD KEY `lab_results_parameter_id_idx` (`parameter_id`),
  ADD KEY `lab_results_status_idx` (`status`),
  ADD KEY `lab_results_interpretation_idx` (`interpretation`),
  ADD KEY `lab_results_is_abnormal_idx` (`is_abnormal`),
  ADD KEY `lab_results_is_critical_idx` (`is_critical`);

--
-- Indexes for table `lab_tests`
--
ALTER TABLE `lab_tests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_tests_test_number_key` (`test_number`),
  ADD KEY `lab_tests_test_number_idx` (`test_number`),
  ADD KEY `lab_tests_test_type_idx` (`test_type`),
  ADD KEY `lab_tests_status_idx` (`status`),
  ADD KEY `lab_tests_urgency_idx` (`urgency`),
  ADD KEY `lab_tests_patient_id_fkey` (`patient_id`),
  ADD KEY `lab_tests_doctor_id_fkey` (`doctor_id`);

--
-- Indexes for table `lab_test_panels`
--
ALTER TABLE `lab_test_panels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lab_test_panels_lab_test_id_panel_id_key` (`lab_test_id`,`panel_id`),
  ADD KEY `lab_test_panels_panel_id_fkey` (`panel_id`);

--
-- Indexes for table `medical_alerts`
--
ALTER TABLE `medical_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_alerts_patient_id_idx` (`patient_id`),
  ADD KEY `medical_alerts_severity_idx` (`severity`),
  ADD KEY `medical_alerts_is_active_idx` (`is_active`);

--
-- Indexes for table `medical_documents`
--
ALTER TABLE `medical_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_documents_patient_id_idx` (`patient_id`),
  ADD KEY `medical_documents_type_idx` (`type`),
  ADD KEY `medical_documents_created_at_idx` (`created_at`),
  ADD KEY `medical_documents_medical_record_id_fkey` (`medical_record_id`);

--
-- Indexes for table `medical_prescriptions`
--
ALTER TABLE `medical_prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_prescriptions_medical_record_id_idx` (`medical_record_id`),
  ADD KEY `medical_prescriptions_medicine_id_idx` (`medicine_id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_records_patient_id_idx` (`patient_id`),
  ADD KEY `medical_records_doctor_id_idx` (`doctor_id`),
  ADD KEY `medical_records_record_type_idx` (`record_type`),
  ADD KEY `medical_records_created_at_idx` (`created_at`),
  ADD KEY `medical_records_appointment_id_fkey` (`appointment_id`);

--
-- Indexes for table `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_reports_type_idx` (`type`),
  ADD KEY `medical_reports_status_idx` (`status`),
  ADD KEY `medical_reports_requested_by_idx` (`requested_by`),
  ADD KEY `medical_reports_requested_at_idx` (`requested_at`),
  ADD KEY `medical_reports_expires_at_idx` (`expires_at`),
  ADD KEY `medical_reports_generated_by_fkey` (`generated_by`);

--
-- Indexes for table `medical_templates`
--
ALTER TABLE `medical_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_templates_category_idx` (`category`),
  ADD KEY `medical_templates_templateType_idx` (`templateType`),
  ADD KEY `medical_templates_is_active_idx` (`is_active`),
  ADD KEY `medical_templates_created_by_idx` (`created_by`),
  ADD KEY `medical_templates_specialization_idx` (`specialization`);

--
-- Indexes for table `medical_template_instances`
--
ALTER TABLE `medical_template_instances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medical_template_instances_template_id_idx` (`template_id`),
  ADD KEY `medical_template_instances_patient_id_idx` (`patient_id`),
  ADD KEY `medical_template_instances_medical_record_id_idx` (`medical_record_id`),
  ADD KEY `medical_template_instances_completed_by_idx` (`completed_by`),
  ADD KEY `medical_template_instances_status_idx` (`status`),
  ADD KEY `medical_template_instances_completed_at_idx` (`completed_at`),
  ADD KEY `medical_template_instances_last_modified_by_fkey` (`last_modified_by`);

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medicines_name_idx` (`name`),
  ADD KEY `medicines_category_idx` (`category`),
  ADD KEY `medicines_expiry_date_idx` (`expiry_date`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patients_patient_id_key` (`patient_id`),
  ADD KEY `patients_patient_id_idx` (`patient_id`),
  ADD KEY `patients_first_name_last_name_idx` (`first_name`,`last_name`),
  ADD KEY `patients_phone_idx` (`phone`),
  ADD KEY `patients_status_idx` (`status`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_key` (`name`),
  ADD UNIQUE KEY `permissions_resource_action_key` (`resource`,`action`),
  ADD KEY `permissions_resource_idx` (`resource`),
  ADD KEY `permissions_action_idx` (`action`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prescriptions_medicine_id_fkey` (`medicine_id`);

--
-- Indexes for table `report_templates`
--
ALTER TABLE `report_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_templates_type_idx` (`type`),
  ADD KEY `report_templates_is_public_idx` (`is_public`),
  ADD KEY `report_templates_is_active_idx` (`is_active`),
  ADD KEY `report_templates_created_by_idx` (`created_by`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`),
  ADD KEY `roles_name_idx` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permissions_role_id_permission_id_key` (`role_id`,`permission_id`),
  ADD KEY `role_permissions_role_id_idx` (`role_id`),
  ADD KEY `role_permissions_permission_id_idx` (`permission_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_type_category_key_user_id_key` (`type`,`category`,`key`,`user_id`),
  ADD KEY `settings_type_idx` (`type`),
  ADD KEY `settings_category_idx` (`category`),
  ADD KEY `settings_user_id_idx` (`user_id`);

--
-- Indexes for table `treatments`
--
ALTER TABLE `treatments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treatments_patient_id_idx` (`patient_id`),
  ADD KEY `treatments_diagnosis_id_idx` (`diagnosis_id`),
  ADD KEY `treatments_status_idx` (`status`);

--
-- Indexes for table `treatment_goals`
--
ALTER TABLE `treatment_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treatment_goals_treatment_plan_id_idx` (`treatment_plan_id`),
  ADD KEY `treatment_goals_status_idx` (`status`),
  ADD KEY `treatment_goals_target_date_idx` (`target_date`),
  ADD KEY `treatment_goals_is_active_idx` (`is_active`),
  ADD KEY `treatment_goals_assigned_to_fkey` (`assigned_to`),
  ADD KEY `treatment_goals_created_by_fkey` (`created_by`);

--
-- Indexes for table `treatment_plans`
--
ALTER TABLE `treatment_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treatment_plans_patient_id_idx` (`patient_id`),
  ADD KEY `treatment_plans_doctor_id_idx` (`doctor_id`),
  ADD KEY `treatment_plans_status_idx` (`status`),
  ADD KEY `treatment_plans_start_date_idx` (`start_date`),
  ADD KEY `treatment_plans_is_active_idx` (`is_active`),
  ADD KEY `treatment_plans_created_by_fkey` (`created_by`),
  ADD KEY `treatment_plans_updated_by_fkey` (`updated_by`);

--
-- Indexes for table `treatment_progress`
--
ALTER TABLE `treatment_progress`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treatment_progress_treatment_plan_id_idx` (`treatment_plan_id`),
  ADD KEY `treatment_progress_goal_id_idx` (`goal_id`),
  ADD KEY `treatment_progress_task_id_idx` (`task_id`),
  ADD KEY `treatment_progress_date_idx` (`date`),
  ADD KEY `treatment_progress_progress_type_idx` (`progress_type`),
  ADD KEY `treatment_progress_recorded_by_fkey` (`recorded_by`);

--
-- Indexes for table `treatment_reviews`
--
ALTER TABLE `treatment_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treatment_reviews_treatment_plan_id_idx` (`treatment_plan_id`),
  ADD KEY `treatment_reviews_review_date_idx` (`review_date`),
  ADD KEY `treatment_reviews_review_type_idx` (`review_type`),
  ADD KEY `treatment_reviews_reviewed_by_fkey` (`reviewed_by`);

--
-- Indexes for table `treatment_tasks`
--
ALTER TABLE `treatment_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `treatment_tasks_treatment_plan_id_idx` (`treatment_plan_id`),
  ADD KEY `treatment_tasks_goal_id_idx` (`goal_id`),
  ADD KEY `treatment_tasks_status_idx` (`status`),
  ADD KEY `treatment_tasks_due_date_idx` (`due_date`),
  ADD KEY `treatment_tasks_task_type_idx` (`task_type`),
  ADD KEY `treatment_tasks_is_active_idx` (`is_active`),
  ADD KEY `treatment_tasks_assigned_to_fkey` (`assigned_to`),
  ADD KEY `treatment_tasks_created_by_fkey` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_employee_id_key` (`employee_id`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_employee_id_idx` (`employee_id`),
  ADD KEY `users_role_idx` (`role`);

--
-- Indexes for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_groups_user_id_group_id_key` (`user_id`,`group_id`),
  ADD KEY `user_groups_user_id_idx` (`user_id`),
  ADD KEY `user_groups_group_id_idx` (`group_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_roles_user_id_role_id_key` (`user_id`,`role_id`),
  ADD KEY `user_roles_user_id_idx` (`user_id`),
  ADD KEY `user_roles_role_id_idx` (`role_id`);

--
-- Indexes for table `vital_signs`
--
ALTER TABLE `vital_signs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vital_signs_patient_id_idx` (`patient_id`),
  ADD KEY `vital_signs_type_idx` (`type`),
  ADD KEY `vital_signs_measured_at_idx` (`measured_at`),
  ADD KEY `vital_signs_medical_record_id_fkey` (`medical_record_id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admissions`
--
ALTER TABLE `admissions`
  ADD CONSTRAINT `admissions_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `admissions_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `allergies`
--
ALTER TABLE `allergies`
  ADD CONSTRAINT `allergies_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `bills`
--
ALTER TABLE `bills`
  ADD CONSTRAINT `bills_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `bill_items`
--
ALTER TABLE `bill_items`
  ADD CONSTRAINT `bill_items_bill_id_fkey` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `diagnoses`
--
ALTER TABLE `diagnoses`
  ADD CONSTRAINT `diagnoses_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `group_permissions`
--
ALTER TABLE `group_permissions`
  ADD CONSTRAINT `group_permissions_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `group_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `immunizations`
--
ALTER TABLE `immunizations`
  ADD CONSTRAINT `immunizations_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `lab_panel_tests`
--
ALTER TABLE `lab_panel_tests`
  ADD CONSTRAINT `lab_panel_tests_panel_id_fkey` FOREIGN KEY (`panel_id`) REFERENCES `lab_panels` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `lab_panel_tests_parameter_id_fkey` FOREIGN KEY (`parameter_id`) REFERENCES `lab_parameters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `lab_results`
--
ALTER TABLE `lab_results`
  ADD CONSTRAINT `lab_results_lab_test_id_fkey` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `lab_results_parameter_id_fkey` FOREIGN KEY (`parameter_id`) REFERENCES `lab_parameters` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `lab_tests`
--
ALTER TABLE `lab_tests`
  ADD CONSTRAINT `lab_tests_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `lab_tests_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `lab_test_panels`
--
ALTER TABLE `lab_test_panels`
  ADD CONSTRAINT `lab_test_panels_lab_test_id_fkey` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `lab_test_panels_panel_id_fkey` FOREIGN KEY (`panel_id`) REFERENCES `lab_panels` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medical_alerts`
--
ALTER TABLE `medical_alerts`
  ADD CONSTRAINT `medical_alerts_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medical_documents`
--
ALTER TABLE `medical_documents`
  ADD CONSTRAINT `medical_documents_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_documents_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medical_prescriptions`
--
ALTER TABLE `medical_prescriptions`
  ADD CONSTRAINT `medical_prescriptions_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_prescriptions_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_appointment_id_fkey` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_records_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_records_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medical_reports`
--
ALTER TABLE `medical_reports`
  ADD CONSTRAINT `medical_reports_generated_by_fkey` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_reports_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `medical_templates`
--
ALTER TABLE `medical_templates`
  ADD CONSTRAINT `medical_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `medical_template_instances`
--
ALTER TABLE `medical_template_instances`
  ADD CONSTRAINT `medical_template_instances_completed_by_fkey` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_template_instances_last_modified_by_fkey` FOREIGN KEY (`last_modified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_template_instances_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_template_instances_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `medical_template_instances_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `medical_templates` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD CONSTRAINT `prescriptions_medicine_id_fkey` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `report_templates`
--
ALTER TABLE `report_templates`
  ADD CONSTRAINT `report_templates_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `treatments`
--
ALTER TABLE `treatments`
  ADD CONSTRAINT `treatments_diagnosis_id_fkey` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnoses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatments_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `treatment_goals`
--
ALTER TABLE `treatment_goals`
  ADD CONSTRAINT `treatment_goals_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_goals_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_goals_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `treatment_plans`
--
ALTER TABLE `treatment_plans`
  ADD CONSTRAINT `treatment_plans_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_plans_doctor_id_fkey` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_plans_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_plans_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `treatment_progress`
--
ALTER TABLE `treatment_progress`
  ADD CONSTRAINT `treatment_progress_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `treatment_goals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_progress_recorded_by_fkey` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_progress_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `treatment_tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_progress_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `treatment_reviews`
--
ALTER TABLE `treatment_reviews`
  ADD CONSTRAINT `treatment_reviews_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_reviews_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `treatment_tasks`
--
ALTER TABLE `treatment_tasks`
  ADD CONSTRAINT `treatment_tasks_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_tasks_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_tasks_goal_id_fkey` FOREIGN KEY (`goal_id`) REFERENCES `treatment_goals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `treatment_tasks_treatment_plan_id_fkey` FOREIGN KEY (`treatment_plan_id`) REFERENCES `treatment_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_groups`
--
ALTER TABLE `user_groups`
  ADD CONSTRAINT `user_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vital_signs`
--
ALTER TABLE `vital_signs`
  ADD CONSTRAINT `vital_signs_medical_record_id_fkey` FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `vital_signs_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
