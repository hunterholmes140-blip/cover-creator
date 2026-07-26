-- ============================================================
-- NextScale Exclusive Admin Account Reset SQL Script
-- phpMyAdmin-এর admins টেবিলে এডমিন এক্সেস আপডেট করার কোড
-- ============================================================
-- 
-- এই SQL চালানোর পর এডমিন প্যানেলে লগইন করার ক্রেডেনশিয়াল:
-- Email: admin@nextscale.com
-- Password: admin123
-- ============================================================

CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Super Admin',
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) DEFAULT NULL,
  `token_expires_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin Insert or Update in admins table ONLY
INSERT INTO `admins` (`id`, `name`, `email`, `password`)
VALUES (1, 'Super Admin', 'admin@nextscale.com', '$2a$10$wT0E0S7uFkK4c1vB.eFmduL4QzG8dJ9W4mXq/J2G1/vL0Z2V3Y4Z5')
ON DUPLICATE KEY UPDATE 
  `email` = 'admin@nextscale.com',
  `password` = '$2a$10$wT0E0S7uFkK4c1vB.eFmduL4QzG8dJ9W4mXq/J2G1/vL0Z2V3Y4Z5';
