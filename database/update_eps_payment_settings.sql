-- ============================================================
-- NextScale EPS Payment Gateway Credentials SQL Script
-- phpMyAdmin-এ চালিয়ে আপনার Database-এ EPS Payment Option যুক্ত করুন
-- ============================================================

INSERT INTO `site_content` (`content_key`, `content_json`) VALUES
('eps_settings', '{"enabled":1,"is_sandbox":1,"username":"","password":"","merchant_id":"","store_id":"","hash_key":""}')
ON DUPLICATE KEY UPDATE `content_json` = VALUES(`content_json`);
