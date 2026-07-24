-- ============================================================
-- Add preview_video column to courses table
-- phpMyAdmin-এ চালিয়ে Database-এ preview_video কলামটি যুক্ত করুন
-- ============================================================

ALTER TABLE `courses` ADD COLUMN `preview_video` VARCHAR(500) DEFAULT NULL AFTER `thumbnail`;
