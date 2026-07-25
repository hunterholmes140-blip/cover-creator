-- ============================================================
-- NextScale Course Modules Field SQL Update Script
-- phpMyAdmin-এ চালিয়ে আপনার বিদ্যমান Database-এর courses টেবিলে modules_json কলাম যুক্ত করুন
-- ============================================================

ALTER TABLE `courses`
  ADD COLUMN `modules_json` LONGTEXT DEFAULT NULL AFTER `recordings_json`;
