-- ============================================================
-- NextScale Course Image Upload Fix SQL Update Script
-- phpMyAdmin-এ চালিয়ে আপনার বিদ্যমান Database-এর courses টেবিলে thumbnail LONGTEXT করুন
-- ============================================================

ALTER TABLE `courses` MODIFY COLUMN `thumbnail` LONGTEXT DEFAULT NULL;
ALTER TABLE `courses` MODIFY COLUMN `preview_video` LONGTEXT DEFAULT NULL;
ALTER TABLE `courses` MODIFY COLUMN `description` LONGTEXT DEFAULT NULL;
