-- ============================================================
-- NextScale Course Badge Field SQL Update Script
-- phpMyAdmin-এ চালিয়ে আপনার বিদ্যমান Database-এর courses টেবিলে badge কলাম যুক্ত করুন
-- ============================================================

ALTER TABLE `courses`
  ADD COLUMN `badge` TEXT DEFAULT NULL AFTER `is_featured`;
