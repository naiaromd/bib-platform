CREATE TABLE IF NOT EXISTS `finance_document_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'bib' NOT NULL,
	`document_type` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`file_name` text NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`source_sheet` text DEFAULT '' NOT NULL,
	`file_hash` text DEFAULT '' NOT NULL,
	`byte_size` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'รอตรวจสอบ' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `finance_document_period_idx`
	ON `finance_document_registry` (`tenant_id`, `period_start`, `period_end`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `finance_monthly_actuals` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'bib' NOT NULL,
	`business_unit` text DEFAULT 'icoone Thailand' NOT NULL,
	`period_month` text NOT NULL,
	`revenue_satang` integer DEFAULT 0 NOT NULL,
	`cogs_satang` integer DEFAULT 0 NOT NULL,
	`gross_profit_satang` integer DEFAULT 0 NOT NULL,
	`opex_satang` integer DEFAULT 0 NOT NULL,
	`net_profit_satang` integer DEFAULT 0 NOT NULL,
	`source_document_id` text NOT NULL,
	`entry_method` text DEFAULT 'Imported' NOT NULL,
	`status` text DEFAULT 'นำเข้าแล้ว · รอตรวจ' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `finance_monthly_actual_period_idx`
	ON `finance_monthly_actuals` (`tenant_id`, `business_unit`, `period_month`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `partner_marketing_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'bib' NOT NULL,
	`account_id` text NOT NULL,
	`report_month` text NOT NULL,
	`submitted_amount_satang` integer DEFAULT 0 NOT NULL,
	`eligible_amount_satang` integer DEFAULT 0 NOT NULL,
	`excluded_amount_satang` integer DEFAULT 0 NOT NULL,
	`monthly_cap_satang` integer DEFAULT 5000000 NOT NULL,
	`invoice_document_id` text DEFAULT '' NOT NULL,
	`payment_document_id` text DEFAULT '' NOT NULL,
	`evidence_status` text DEFAULT 'ยังไม่ได้รับหลักฐาน' NOT NULL,
	`review_status` text DEFAULT 'รอตรวจ' NOT NULL,
	`review_note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `partner_marketing_claim_period_idx`
	ON `partner_marketing_claims` (`tenant_id`, `account_id`, `report_month`);
-- Data statement omitted during privacy-safe migration.

-- Data statement omitted during privacy-safe migration.

-- Data statement omitted during privacy-safe migration.

