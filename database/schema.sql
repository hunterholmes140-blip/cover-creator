-- ============================================================
-- NextScale Course Selling Platform - Database Schema
-- MySQL / MariaDB (phpMyAdmin দিয়ে import করুন)
-- ============================================================
-- ব্যবহার:
-- 1) phpMyAdmin খুলুন → নতুন database তৈরি করুন (utf8mb4_unicode_ci)
-- 2) সেই database সিলেক্ট করে "Import" ট্যাব → এই ফাইল আপলোড → Go
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- ADMINS ----------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `token` VARCHAR(128) DEFAULT NULL,
  `token_expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_admin_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ডিফল্ট এডমিন: admin@nextscale.com / admin123
-- (bcryptjs hash of "admin123")
INSERT INTO `admins` (`name`, `email`, `password`) VALUES
('Super Admin', 'admin@nextscale.com', '$2b$10$e1lqtHxRVOVvW2oD4WbEcuvKFZ9kVckcq.6oi3YGmC24l4VIh6HfC');


-- ---------- USERS ----------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `token` VARCHAR(128) DEFAULT NULL,
  `token_expires_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- CATEGORIES ----------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categories` (`name`, `slug`) VALUES
('ওয়েব ডেভেলপমেন্ট', 'web-development'),
('গ্রাফিক ডিজাইন', 'graphic-design'),
('ডিজিটাল মার্কেটিং', 'digital-marketing'),
('ভিডিও এডিটিং', 'video-editing');

-- ---------- COURSES ----------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `short_description` VARCHAR(300) DEFAULT NULL,
  `description` TEXT,
  `thumbnail` VARCHAR(255) DEFAULT NULL,
  `preview_video` VARCHAR(500) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `discount_price` DECIMAL(10,2) DEFAULT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `instructor` VARCHAR(100) DEFAULT NULL,
  `duration` VARCHAR(50) DEFAULT NULL,
  `live_class_link` VARCHAR(500) DEFAULT NULL,
  `secret_group_link` VARCHAR(500) DEFAULT NULL,
  `class_routine` VARCHAR(255) DEFAULT NULL,
  `notice` TEXT DEFAULT NULL,
  `recordings_json` LONGTEXT DEFAULT NULL,
  `level` ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_course_category` (`category_id`),
  INDEX `idx_course_published` (`is_published`),
  CONSTRAINT `fk_course_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- LESSONS ----------
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `video_url` VARCHAR(500) DEFAULT NULL,
  `content` TEXT,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_preview` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_lesson_course` (`course_id`),
  CONSTRAINT `fk_lesson_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- ORDERS ----------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_method` ENUM('bkash','nagad','rocket','manual') NOT NULL DEFAULT 'bkash',
  `sender_number` VARCHAR(20) DEFAULT NULL,
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `note` TEXT,
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_user` (`user_id`),
  INDEX `idx_order_course` (`course_id`),
  INDEX `idx_order_status` (`status`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- ENROLLMENTS ----------
DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE `enrollments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `course_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED DEFAULT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_course` (`user_id`,`course_id`),
  CONSTRAINT `fk_enroll_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- SITE SETTINGS ----------
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'NextScale Academy'),
('site_tagline', 'ক্যারিয়ার গড়ুন প্রফেশনাল কোর্সে'),
('hero_title', 'আপনার ভবিষ্যৎ শুরু হোক এখান থেকে'),
('hero_subtitle', 'ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন আধুনিক স্কিল'),
('contact_email', 'info@nextscale.com'),
('contact_phone', '+8801XXXXXXXXX'),
('bkash_number', '01XXXXXXXXX'),
('nagad_number', '01XXXXXXXXX'),
('rocket_number', '01XXXXXXXXX'),
('facebook_url', ''),
('youtube_url', '');

-- ---------- DEMO COURSE (optional) ----------
INSERT INTO `courses`
(`title`, `slug`, `short_description`, `description`, `price`, `discount_price`, `category_id`, `instructor`, `duration`, `level`, `is_featured`)
VALUES
('সম্পূর্ণ ওয়েব ডেভেলপমেন্ট বুটক্যাম্প', 'complete-web-development',
 'HTML, CSS, JavaScript, React ও Node.js — জিরো থেকে প্রফেশনাল লেভেল পর্যন্ত।',
 'এই কোর্সে আপনি শিখবেন আধুনিক ওয়েব ডেভেলপমেন্টের সম্পূর্ণ স্ট্যাক। ৫০+ ঘণ্টার ভিডিও, ১০টি রিয়েল প্রজেক্ট।',
 5000.00, 3500.00, 1, 'রফিকুল ইসলাম', '৫০ ঘণ্টা', 'beginner', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Generic key/value JSON content
-- Used by /admin/homepage, /admin/footer, and any other editable
-- section that does not need its own relational table.
-- Read via GET /content.php?key=... (public)
-- Write via PUT /admin/content.php  (admin only)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_content (
    content_key  VARCHAR(64) PRIMARY KEY,
    content_json LONGTEXT NOT NULL,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- COUPONS ----------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discount_type` ENUM('fixed', 'percent') NOT NULL DEFAULT 'fixed',
  `discount_value` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `max_uses` INT UNSIGNED DEFAULT NULL,
  `used_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `expiry_date` DATE DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_coupon_code` (`code`),
  INDEX `idx_coupon_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- USER SESSIONS & DEVICES ----------
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `session_token` VARCHAR(255) NOT NULL UNIQUE,
  `device_type` VARCHAR(50) DEFAULT 'desktop',
  `device_name` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `last_active` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_session_user` (`user_id`),
  INDEX `idx_session_token` (`session_token`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
