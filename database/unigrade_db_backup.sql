-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: unigrade_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_sessions`
--

DROP TABLE IF EXISTS `academic_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('ACTIVE','INACTIVE','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INACTIVE',
  PRIMARY KEY (`id`),
  KEY `idx_sessions_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_sessions`
--

LOCK TABLES `academic_sessions` WRITE;
/*!40000 ALTER TABLE `academic_sessions` DISABLE KEYS */;
INSERT INTO `academic_sessions` VALUES (3,'2026-2027 Academic Year','2026-07-01','2027-06-30','ACTIVE'),(4,'2025-2026 Academic Year','2025-07-01','2026-06-30','ARCHIVED'),(5,'2026-2030','2026-11-17','2030-06-16','INACTIVE');
/*!40000 ALTER TABLE `academic_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int NOT NULL,
  `target_role` enum('ALL','ADMIN','FACULTY','STUDENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALL',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_announcements_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'UniGrade Online System Initialized','Welcome to the university examination portal. The academic catalog and faculty schedules can now be configured.',1,'ALL',1,'2026-11-12 21:51:58',NULL);
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_components`
--

DROP TABLE IF EXISTS `assessment_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_components` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `component_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_type` enum('INTERNAL','CLASS_TEST','QUIZ','ASSIGNMENT','PRACTICAL','MIDTERM','FINAL','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `maximum_marks` decimal(8,2) NOT NULL,
  `weight_percentage` decimal(5,2) NOT NULL,
  `minimum_pass_percentage` decimal(5,2) DEFAULT NULL,
  `is_mandatory` tinyint(1) NOT NULL DEFAULT '1',
  `examination_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SCHEDULED','ONGOING','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  PRIMARY KEY (`id`),
  KEY `idx_assessments_offering` (`offering_id`),
  CONSTRAINT `fk_assessments_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_components`
--

LOCK TABLES `assessment_components` WRITE;
/*!40000 ALTER TABLE `assessment_components` DISABLE KEYS */;
INSERT INTO `assessment_components` VALUES (1,1,'Mid-Semester Examination','MIDTERM',50.00,30.00,40.00,1,'2026-10-15','10:00:00','12:00:00','Tech Aud-1','COMPLETED'),(2,1,'End-Semester Final Examination','FINAL',100.00,50.00,40.00,1,'2026-12-10','09:30:00','12:30:00','Exam Hall Alpha','COMPLETED'),(3,1,'Lab Practical & Project Evaluation','PRACTICAL',50.00,20.00,40.00,1,'2026-11-20','14:00:00','17:00:00','Advanced CS Lab 2','COMPLETED'),(4,2,'Mid-Semester Examination','MIDTERM',50.00,30.00,40.00,1,'2026-10-15','10:00:00','12:00:00','Tech Aud-1','COMPLETED'),(5,2,'End-Semester Final Examination','FINAL',100.00,50.00,40.00,1,'2026-12-10','09:30:00','12:30:00','Exam Hall Alpha','COMPLETED'),(6,2,'Lab Practical & Project Evaluation','PRACTICAL',50.00,20.00,40.00,1,'2026-11-20','14:00:00','17:00:00','Advanced CS Lab 2','COMPLETED'),(7,3,'Mid-Semester Examination','MIDTERM',50.00,30.00,40.00,1,'2026-10-15','10:00:00','12:00:00','Tech Aud-1','COMPLETED'),(8,3,'End-Semester Final Examination','FINAL',100.00,50.00,40.00,1,'2026-12-10','09:30:00','12:30:00','Exam Hall Alpha','COMPLETED'),(9,3,'Lab Practical & Project Evaluation','PRACTICAL',50.00,20.00,40.00,1,'2026-11-20','14:00:00','17:00:00','Advanced CS Lab 2','COMPLETED'),(10,4,'Mid-Semester Examination','MIDTERM',50.00,30.00,40.00,1,'2026-10-15','10:00:00','12:00:00','Tech Aud-1','COMPLETED'),(11,4,'End-Semester Final Examination','FINAL',100.00,50.00,40.00,1,'2026-12-10','09:30:00','12:30:00','Exam Hall Alpha','COMPLETED'),(12,4,'Lab Practical & Project Evaluation','PRACTICAL',50.00,20.00,40.00,1,'2026-11-20','14:00:00','17:00:00','Advanced CS Lab 2','COMPLETED');
/*!40000 ALTER TABLE `assessment_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_marks`
--

DROP TABLE IF EXISTS `assessment_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_marks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_component_id` int NOT NULL,
  `enrollment_id` int NOT NULL,
  `obtained_marks` decimal(8,2) DEFAULT NULL,
  `attendance_status` enum('PRESENT','ABSENT','EXCUSED','NOT_ENTERED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_ENTERED',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `entered_by` int NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_marks_component_enrollment` (`assessment_component_id`,`enrollment_id`),
  KEY `idx_marks_enrollment` (`enrollment_id`),
  KEY `fk_marks_entered_by` (`entered_by`),
  CONSTRAINT `fk_marks_component` FOREIGN KEY (`assessment_component_id`) REFERENCES `assessment_components` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_marks_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `student_enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_marks_entered_by` FOREIGN KEY (`entered_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_marks`
--

LOCK TABLES `assessment_marks` WRITE;
/*!40000 ALTER TABLE `assessment_marks` DISABLE KEYS */;
INSERT INTO `assessment_marks` VALUES (1,1,1,47.00,'PRESENT','Outstanding analytical performance',13,'2026-11-16 12:05:35'),(2,2,1,94.00,'PRESENT','Outstanding analytical performance',13,'2026-11-16 12:05:35'),(3,3,1,48.00,'PRESENT','Outstanding analytical performance',13,'2026-11-16 12:05:35'),(4,1,2,43.00,'PRESENT','Strong algorithmic foundations',13,'2026-11-16 12:05:35'),(5,2,2,86.00,'PRESENT','Strong algorithmic foundations',13,'2026-11-16 12:05:35'),(6,3,2,44.00,'PRESENT','Strong algorithmic foundations',13,'2026-11-16 12:05:35'),(7,1,3,38.00,'PRESENT','Consistent performance in exams',13,'2026-11-16 12:05:35'),(8,2,3,78.00,'PRESENT','Consistent performance in exams',13,'2026-11-16 12:05:35'),(9,3,3,40.00,'PRESENT','Consistent performance in exams',13,'2026-11-16 12:05:35'),(10,1,4,36.00,'PRESENT','Good conceptual comprehension',13,'2026-11-16 12:05:35'),(11,2,4,74.00,'PRESENT','Good conceptual comprehension',13,'2026-11-16 12:05:35'),(12,3,4,39.00,'PRESENT','Good conceptual comprehension',13,'2026-11-16 12:05:35');
/*!40000 ALTER TABLE `assessment_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 14:17:02'),(2,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 14:20:05'),(3,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 16:08:39'),(4,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 16:52:31'),(5,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 21:12:39'),(6,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 21:18:08'),(7,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 21:21:15'),(8,1,'CREATE_STUDENT','users',12,NULL,'{\"email\": \"srinjoyee.goswami@gmail.com\"}','::1','2026-11-13 21:21:48'),(9,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 21:25:55'),(10,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-13 21:31:51'),(11,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-16 12:17:03'),(12,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-16 14:41:46'),(13,1,'LOGOUT','users',1,NULL,NULL,'::1','2026-11-16 14:58:01'),(14,12,'LOGIN','users',12,NULL,NULL,'::1','2026-11-16 14:58:05'),(15,1,'LOGIN','users',1,NULL,NULL,'::1','2026-11-16 15:34:47');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_offerings`
--

DROP TABLE IF EXISTS `course_offerings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_offerings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `program_id` int NOT NULL,
  `academic_session_id` int NOT NULL,
  `semester_number` tinyint NOT NULL DEFAULT '1',
  `section` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'A',
  `faculty_user_id` int NOT NULL,
  `enrollment_capacity` int NOT NULL DEFAULT '60',
  `status` enum('ACTIVE','INACTIVE','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  KEY `idx_offerings_course` (`course_id`),
  KEY `idx_offerings_program` (`program_id`),
  KEY `idx_offerings_session` (`academic_session_id`),
  KEY `idx_offerings_faculty` (`faculty_user_id`),
  CONSTRAINT `fk_offerings_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_offerings_faculty` FOREIGN KEY (`faculty_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_offerings_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_offerings_session` FOREIGN KEY (`academic_session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_offerings`
--

LOCK TABLES `course_offerings` WRITE;
/*!40000 ALTER TABLE `course_offerings` DISABLE KEYS */;
INSERT INTO `course_offerings` VALUES (1,1,1,3,1,'A',13,60,'ACTIVE'),(2,2,1,3,1,'A',14,60,'ACTIVE'),(3,5,4,3,1,'A',15,60,'ACTIVE'),(4,4,2,3,1,'A',14,60,'ACTIVE');
/*!40000 ALTER TABLE `course_offerings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_results`
--

DROP TABLE IF EXISTS `course_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_id` int NOT NULL,
  `total_percentage` decimal(6,3) DEFAULT NULL,
  `total_marks` decimal(8,2) DEFAULT NULL,
  `letter_grade` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade_point` decimal(4,2) DEFAULT NULL,
  `result_status` enum('INCOMPLETE','PROCESSING','PROVISIONAL','PUBLISHED','WITHHELD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INCOMPLETE',
  `grading_policy_snapshot` json DEFAULT NULL,
  `calculated_at` timestamp NULL DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `published_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_results_enrollment` (`enrollment_id`),
  KEY `idx_results_status` (`result_status`),
  KEY `fk_results_published_by` (`published_by`),
  CONSTRAINT `fk_results_enrollment` FOREIGN KEY (`enrollment_id`) REFERENCES `student_enrollments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_results_published_by` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_results`
--

LOCK TABLES `course_results` WRITE;
/*!40000 ALTER TABLE `course_results` DISABLE KEYS */;
INSERT INTO `course_results` VALUES (1,1,94.400,189.00,'O',10.00,'PUBLISHED',NULL,'2026-11-16 12:05:35','2026-11-16 12:05:35',1),(2,2,86.400,173.00,'A+',9.00,'PUBLISHED',NULL,'2026-11-16 12:05:35','2026-11-16 12:05:35',1),(3,3,77.800,156.00,'A',8.00,'PUBLISHED',NULL,'2026-11-16 12:05:35','2026-11-16 12:05:35',1),(4,4,74.200,149.00,'A',8.00,'PUBLISHED',NULL,'2026-11-16 12:05:35','2026-11-16 12:05:35',1);
/*!40000 ALTER TABLE `course_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `department_id` int NOT NULL,
  `credit_hours` tinyint NOT NULL DEFAULT '3',
  `course_type` enum('THEORY','PRACTICAL','LAB','SEMINAR') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'THEORY',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_code` (`course_code`),
  KEY `idx_courses_dept` (`department_id`),
  KEY `idx_courses_status` (`status`),
  CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'CS101','Data Structures & Algorithms','Fundamental linear & non-linear data structures, trees, graphs, sorting & dynamic programming.',1,4,'THEORY','ACTIVE'),(2,'CS102','Database Management Systems','Relational data model, relational algebra, SQL querying, normalization and ACID transaction management.',1,4,'THEORY','ACTIVE'),(3,'CS103','Operating Systems & Linux Architecture','Process scheduling, concurrency, virtual memory management, system calls and storage subsystems.',1,4,'THEORY','ACTIVE'),(4,'IT101','Full-Stack Web Technologies','Modern web architectures, responsive client frameworks (React), microservices and cloud deployment.',2,4,'PRACTICAL','ACTIVE'),(5,'AI101','Artificial Intelligence & Machine Learning','Supervised and unsupervised learning, deep neural network architectures and natural language processing.',5,4,'THEORY','ACTIVE'),(6,'CS104','Computer Networks & Cybersecurity','TCP/IP networking, packet routing, socket programming, cryptography and network protection protocols.',1,3,'THEORY','ACTIVE');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_departments_code` (`department_code`),
  KEY `idx_departments_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Computer Science & Engineering','CSE','Department of Computer Science and Engineering','ACTIVE','2026-11-13 16:08:48'),(2,'Information Technology','IT','Department of Information Technology','ACTIVE','2026-11-13 16:08:48'),(3,'Electronics & Communication Engineering','ECE','Department of Electronics and Hardware Engineering','ACTIVE','2026-11-13 16:08:48'),(4,'General Sciences & Humanities','GEN','Foundational sciences and humanities','ACTIVE','2026-11-13 16:08:48'),(5,'Artificial Intelligence & Data Science','AIDS','Department of Artificial Intelligence and Data Science','ACTIVE','2026-11-16 12:05:35');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty_profiles`
--

DROP TABLE IF EXISTS `faculty_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int NOT NULL,
  `designation` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_joining` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_faculty_user` (`user_id`),
  UNIQUE KEY `uq_faculty_emp_code` (`employee_code`),
  KEY `idx_faculty_dept` (`department_id`),
  CONSTRAINT `fk_faculty_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_faculty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_profiles`
--

LOCK TABLES `faculty_profiles` WRITE;
/*!40000 ALTER TABLE `faculty_profiles` DISABLE KEYS */;
INSERT INTO `faculty_profiles` VALUES (4,13,'FAC-CSE-01',1,'Professor & Head of Department','+91 98450 11223','2018-07-01'),(5,14,'FAC-IT-01',2,'Associate Professor','+91 98450 22334','2020-01-15'),(6,15,'FAC-AI-01',5,'Assistant Professor','+91 98450 33445','2022-08-01');
/*!40000 ALTER TABLE `faculty_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade_scale_bands`
--

DROP TABLE IF EXISTS `grade_scale_bands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grade_scale_bands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `grade_scale_id` int NOT NULL,
  `minimum_percentage` decimal(5,2) NOT NULL,
  `maximum_percentage` decimal(5,2) NOT NULL,
  `letter_grade` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_point` decimal(4,2) NOT NULL,
  `is_passing` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_bands_scale` (`grade_scale_id`),
  CONSTRAINT `fk_bands_scale` FOREIGN KEY (`grade_scale_id`) REFERENCES `grade_scales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_scale_bands`
--

LOCK TABLES `grade_scale_bands` WRITE;
/*!40000 ALTER TABLE `grade_scale_bands` DISABLE KEYS */;
INSERT INTO `grade_scale_bands` VALUES (1,1,90.00,100.00,'O',10.00,1),(2,1,80.00,89.99,'A+',9.00,1),(3,1,70.00,79.99,'A',8.00,1),(4,1,60.00,69.99,'B+',7.00,1),(5,1,50.00,59.99,'B',6.00,1),(6,1,40.00,49.99,'C',5.00,1),(7,1,0.00,39.99,'F',0.00,0);
/*!40000 ALTER TABLE `grade_scale_bands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grade_scales`
--

DROP TABLE IF EXISTS `grade_scales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grade_scales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `program_id` int DEFAULT NULL,
  `scale_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minimum_overall_pass_percentage` decimal(5,2) NOT NULL DEFAULT '40.00',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_scales_program` (`program_id`),
  CONSTRAINT `fk_scales_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade_scales`
--

LOCK TABLES `grade_scales` WRITE;
/*!40000 ALTER TABLE `grade_scales` DISABLE KEYS */;
INSERT INTO `grade_scales` VALUES (1,NULL,'Standard University Scale',40.00,1,'ACTIVE','2026-11-12 21:51:58');
/*!40000 ALTER TABLE `grade_scales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mark_sheet_submissions`
--

DROP TABLE IF EXISTS `mark_sheet_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mark_sheet_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assessment_component_id` int NOT NULL,
  `submitted_by` int NOT NULL,
  `status` enum('DRAFT','SUBMITTED','RETURNED','APPROVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `reviewed_by` int DEFAULT NULL,
  `review_comment` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_submissions_component` (`assessment_component_id`),
  KEY `fk_submissions_submitted_by` (`submitted_by`),
  KEY `fk_submissions_reviewed_by` (`reviewed_by`),
  CONSTRAINT `fk_submissions_component` FOREIGN KEY (`assessment_component_id`) REFERENCES `assessment_components` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_submissions_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_submissions_submitted_by` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mark_sheet_submissions`
--

LOCK TABLES `mark_sheet_submissions` WRITE;
/*!40000 ALTER TABLE `mark_sheet_submissions` DISABLE KEYS */;
INSERT INTO `mark_sheet_submissions` VALUES (1,1,13,'APPROVED',1,'Physical examination sheets verified and approved.','2026-11-16 12:05:35','2026-11-16 12:05:35','2026-11-16 12:05:35','2026-11-16 12:05:35'),(2,2,13,'APPROVED',1,'Physical examination sheets verified and approved.','2026-11-16 12:05:35','2026-11-16 12:05:35','2026-11-16 12:05:35','2026-11-16 12:05:35'),(3,3,13,'APPROVED',1,'Physical examination sheets verified and approved.','2026-11-16 12:05:35','2026-11-16 12:05:35','2026-11-16 12:05:35','2026-11-16 12:05:35');
/*!40000 ALTER TABLE `mark_sheet_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tokens_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programs`
--

DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `program_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `degree_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_years` tinyint NOT NULL DEFAULT '3',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_programs_code` (`program_code`),
  KEY `idx_programs_dept` (`department_id`),
  KEY `idx_programs_status` (`status`),
  CONSTRAINT `fk_programs_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programs`
--

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES (1,1,'B.Tech in Computer Science & Engineering','BTECH-CSE','UNDERGRADUATE',4,'ACTIVE'),(2,2,'B.Tech in Information Technology','BTECH-IT','UNDERGRADUATE',4,'ACTIVE'),(3,1,'Master of Technology in Computer Science','MTECH-CSE','POSTGRADUATE',2,'ACTIVE'),(4,5,'B.Tech in Artificial Intelligence & Data Science','BTECH-AI','UNDERGRADUATE',4,'ACTIVE');
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_enrollments`
--

DROP TABLE IF EXISTS `student_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `offering_id` int NOT NULL,
  `student_user_id` int NOT NULL,
  `enrollment_date` date NOT NULL,
  `status` enum('ENROLLED','DROPPED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ENROLLED',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollment` (`offering_id`,`student_user_id`),
  KEY `idx_enrollments_student` (`student_user_id`),
  CONSTRAINT `fk_enrollments_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_enrollments`
--

LOCK TABLES `student_enrollments` WRITE;
/*!40000 ALTER TABLE `student_enrollments` DISABLE KEYS */;
INSERT INTO `student_enrollments` VALUES (1,1,12,'2026-07-15','ENROLLED'),(2,1,16,'2026-07-15','ENROLLED'),(3,1,17,'2026-07-15','ENROLLED'),(4,1,18,'2026-07-15','ENROLLED'),(5,2,12,'2026-07-15','ENROLLED'),(6,2,16,'2026-07-15','ENROLLED'),(7,2,17,'2026-07-15','ENROLLED'),(8,3,12,'2026-07-15','ENROLLED'),(9,3,16,'2026-07-15','ENROLLED'),(10,3,17,'2026-07-15','ENROLLED'),(11,4,18,'2026-07-15','ENROLLED');
/*!40000 ALTER TABLE `student_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `roll_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `registration_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `program_id` int NOT NULL,
  `admission_year` year NOT NULL,
  `current_semester` tinyint NOT NULL DEFAULT '1',
  `contact_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_user` (`user_id`),
  UNIQUE KEY `uq_student_roll` (`roll_number`),
  UNIQUE KEY `uq_student_reg` (`registration_number`),
  KEY `idx_student_program` (`program_id`),
  CONSTRAINT `fk_student_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_student_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (11,12,'CS2026001','UG2026CS001',1,2026,1,'+91 98300 12345'),(13,16,'CS2026002','UG2026CS002',1,2026,1,'+91 98300 23456'),(14,17,'CS2026003','UG2026CS003',1,2026,1,'+91 98300 34567'),(15,18,'IT2026001','UG2026IT001',2,2026,1,'+91 98300 45678');
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','FACULTY','STUDENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_status` enum('ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`account_status`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Dr. Rajesh Sharma','admin@unigrade.edu','$2y$10$.enyfbRpHoUg2F/n.5fPfesgME15sp8Q8YoqMt1AP/BHa8Oq6/OES','ADMIN','ACTIVE','2026-11-12 21:51:58','2026-11-16 15:34:47'),(12,'Srinjoyee Goswami','srinjoyee.goswami@gmail.com','$2y$10$WIwbA.wmot1xoCzaF/4ZQOM490ga8H/OuMOnGbgrcsQrF.apSoI2m','STUDENT','ACTIVE','2026-11-13 21:21:48','2026-11-16 14:58:05'),(13,'Dr. Ananya Iyer','ananya.iyer@unigrade.edu','$2y$10$AqNZE4xgICZ3dtlM7guuv.WaTz8OthmxTm8jjl1aSRYWS1qDRaP5e','FACULTY','ACTIVE','2026-11-16 12:05:35','2026-11-16 12:05:35'),(14,'Prof. Vikram Malhotra','vikram.malhotra@unigrade.edu','$2y$10$dfIzs./3ADTs4opY0W/eTeiFlJ3J40YO5p2Y/cH0.2pqgq.0TemBu','FACULTY','ACTIVE','2026-11-16 12:05:35','2026-11-16 12:05:35'),(15,'Dr. Priya Mukherjee','priya.mukherjee@unigrade.edu','$2y$10$OfPmGzz0ayccDxUJvdNfwuKI5a58hsk9ASikUTahKFFwG6aLz18ji','FACULTY','ACTIVE','2026-11-16 12:05:35','2026-11-16 12:05:35'),(16,'Aarav Mehta','aarav.mehta@gmail.com','$2y$10$4hiFcd2/ZT8hapNQYE/0YeWbDXFr5Ae6awfPnNOzY.zOP7T6YPTm.','STUDENT','ACTIVE','2026-11-16 12:05:35','2026-11-16 12:05:35'),(17,'Diya Patel','diya.patel@gmail.com','$2y$10$/f3.cCtUuEYbMteC5z6LtOnVrHjxO1OYZd5OBQeXDOhjv91uuE/pq','STUDENT','ACTIVE','2026-11-16 12:05:35','2026-11-16 12:05:35'),(18,'Rohan Verma','rohan.verma@gmail.com','$2y$10$O/1Sl53L/l4RKQEPZNSOA.cr1eyoL5j0tqxBIFGo7Fb7lOplFfUle','STUDENT','ACTIVE','2026-11-16 12:05:35','2026-11-16 12:05:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-16 21:05:47
