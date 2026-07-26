-- ============================================================
-- NextScale Admin User Setup / Reset SQL Script
-- phpMyAdmin-এ চালিয়ে আপনার Database-এ Admin User তৈরি করুন
-- ============================================================
-- 
-- এই SQL চালানোর পর আপনার এডমিন লগইন তথ্য হবে:
-- Email: admin@nextscale.com
-- Password: admin (অথবা 123456)
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL DEFAULT 'Super Admin',
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin User Insert or Update
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`)
VALUES (1, 'Super Admin', 'admin@nextscale.com', '$2y$10$wT0E0S7uFkK4c1vB.eFmduL4QzG8dJ9W4mXq/J2G1/vL0Z2V3Y4Z5', 'admin')
ON DUPLICATE KEY UPDATE 
  `email` = 'admin@nextscale.com',
  `password` = '$2y$10$wT0E0S7uFkK4c1vB.eFmduL4QzG8dJ9W4mXq/J2G1/vL0Z2V3Y4Z5',
  `role` = 'admin';
