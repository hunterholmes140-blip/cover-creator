-- ============================================================
-- NextScale Coupons Table & Analytics Indexing Update
-- phpMyAdmin-এ চালিয়ে আপনার Database-এ Coupons টেবিল তৈরি করুন
-- ============================================================

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

-- Sample Default Coupons
INSERT INTO `coupons` (`code`, `discount_type`, `discount_value`, `max_uses`, `is_active`) VALUES
('NEXT500', 'fixed', 500.00, 100, 1),
('OFF10', 'percent', 10.00, 50, 1)
ON DUPLICATE KEY UPDATE `is_active` = 1;
