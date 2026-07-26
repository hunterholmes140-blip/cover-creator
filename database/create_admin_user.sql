-- ============================================================
-- NextScale Admin User Create & Reset SQL Script
-- phpMyAdmin-এ চালিয়ে আপনার Database-এ Admin User তৈরি বা পাসওয়ার্ড রিসেট করুন
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin User Insert or Update (Email: admin@nextscale.com, Password: admin123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`)
VALUES (1, 'Super Admin', 'admin@nextscale.com', '$2a$10$636iWcM6jMsmgT4.N632l.n51e06Wq0hZ4p50n2v3y4z5a6b7c8d9', 'admin')
ON DUPLICATE KEY UPDATE 
  `role` = 'admin';
