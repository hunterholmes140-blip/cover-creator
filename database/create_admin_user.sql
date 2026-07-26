-- ============================================================
-- NextScale Exclusive Admin Account Reset SQL Script
-- phpMyAdmin-এর admins টেবিলে এডমিন এক্সেস আপডেট করার কোড
-- ============================================================
-- 
-- এই SQL চালানোর পর এডমিন প্যানেলে লগইন করার নতুন ক্রেডেনশিয়াল:
-- Email: admin@nextscale.com
-- Password: NextScale2026!
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
VALUES (1, 'Super Admin', 'admin@nextscale.com', 'NextScale2026!')
ON DUPLICATE KEY UPDATE 
  `email` = 'admin@nextscale.com',
  `password` = 'NextScale2026!';
