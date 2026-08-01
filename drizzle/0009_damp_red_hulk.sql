ALTER TABLE `client_contacts` ADD `position_title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `phone` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `line_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `preferred_channel` text DEFAULT 'LINE' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `decision_level` text DEFAULT 'ยังไม่ยืนยัน' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `consent_status` text DEFAULT 'ยังไม่ยืนยัน' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `updated_at` text DEFAULT '' NOT NULL;
-- Data statement omitted during privacy-safe migration.

-- Data statement omitted during privacy-safe migration.

-- Data statement omitted during privacy-safe migration.

