-- ============================================================
-- NextScale Live Course & Secret Group Fields Update SQL Script
-- phpMyAdmin-এ চালিয়ে আপনার বিদ্যমান Database টি আপডেট করুন
-- ============================================================

ALTER TABLE `courses`
  ADD COLUMN `live_class_link` VARCHAR(500) DEFAULT NULL AFTER `duration`,
  ADD COLUMN `secret_group_link` VARCHAR(500) DEFAULT NULL AFTER `live_class_link`,
  ADD COLUMN `class_routine` VARCHAR(255) DEFAULT NULL AFTER `secret_group_link`,
  ADD COLUMN `notice` TEXT DEFAULT NULL AFTER `class_routine`,
  ADD COLUMN `recordings_json` LONGTEXT DEFAULT NULL AFTER `notice`;
