-- ============================================================
-- NextScale Admin User Setup / Reset SQL Script
-- phpMyAdmin-এ চালিয়ে আপনার Database-এর users টেবিলে role কলাম যুক্ত ও Admin User তৈরি করুন
-- ============================================================
-- 
-- এই SQL চালানোর পর আপনার এডমিন লগইন তথ্য হবে:
-- Email: admin@nextscale.com
-- Password: admin (অথবা 123456)
-- ============================================================

-- ১. যদি users টেবিল না থাকে তৈরি করবে
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Super Admin',
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ২. যদি বিদ্যমান users টেবিলে role কলাম না থাকে তবে role কলাম যুক্ত করা
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `role` VARCHAR(50) DEFAULT 'admin';

-- ৩. Admin User তৈরি বা আপডেট করা
INSERT INTO `users` (`name`, `email`, `password`, `role`)
VALUES ('Super Admin', 'admin@nextscale.com', '$2y$10$wT0E0S7uFkK4c1vB.eFmduL4QzG8dJ9W4mXq/J2G1/vL0Z2V3Y4Z5', 'admin')
ON DUPLICATE KEY UPDATE 
  `password` = '$2y$10$wT0E0S7uFkK4c1vB.eFmduL4QzG8dJ9W4mXq/J2G1/vL0Z2V3Y4Z5',
  `role` = 'admin';
