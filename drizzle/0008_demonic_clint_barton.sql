CREATE TABLE `consent_records` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`case_id` text NOT NULL,
	`consent_type` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`scope_json` text DEFAULT '{}' NOT NULL,
	`consented_at` text DEFAULT '' NOT NULL,
	`expires_at` text DEFAULT '' NOT NULL,
	`withdrawn_at` text DEFAULT '' NOT NULL,
	`captured_by_email` text NOT NULL,
	`evidence_document_id` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `consent_records_tenant_case_type_idx` ON `consent_records` (`tenant_id`,`case_id`,`consent_type`);--> statement-breakpoint
CREATE INDEX `consent_records_tenant_account_status_idx` ON `consent_records` (`tenant_id`,`account_id`,`status`);--> statement-breakpoint
CREATE TABLE `evidence_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`title` text NOT NULL,
	`period_key` text NOT NULL,
	`instructions` text DEFAULT '' NOT NULL,
	`required_case_count` integer DEFAULT 1 NOT NULL,
	`due_at` text DEFAULT '' NOT NULL,
	`assigned_role` text DEFAULT 'Therapist' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_by_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `evidence_assignments_tenant_account_status_idx` ON `evidence_assignments` (`tenant_id`,`account_id`,`status`);--> statement-breakpoint
CREATE INDEX `evidence_assignments_tenant_period_idx` ON `evidence_assignments` (`tenant_id`,`period_key`);--> statement-breakpoint
CREATE TABLE `evidence_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`assignment_id` text DEFAULT '' NOT NULL,
	`therapist_contact_id` text DEFAULT '' NOT NULL,
	`created_by_email` text NOT NULL,
	`case_reference` text NOT NULL,
	`age_band` text DEFAULT '' NOT NULL,
	`concern_code` text NOT NULL,
	`protocol_code` text DEFAULT '' NOT NULL,
	`program_codes_json` text DEFAULT '[]' NOT NULL,
	`session_count` integer DEFAULT 0 NOT NULL,
	`baseline_date` text DEFAULT '' NOT NULL,
	`follow_up_date` text DEFAULT '' NOT NULL,
	`outcome_measures_json` text DEFAULT '{}' NOT NULL,
	`customer_feedback_json` text DEFAULT '{}' NOT NULL,
	`therapist_summary` text DEFAULT '' NOT NULL,
	`voice_transcript` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`submitted_at` text DEFAULT '' NOT NULL,
	`approved_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `evidence_cases_tenant_account_status_idx` ON `evidence_cases` (`tenant_id`,`account_id`,`status`);--> statement-breakpoint
CREATE INDEX `evidence_cases_tenant_assignment_idx` ON `evidence_cases` (`tenant_id`,`assignment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_cases_tenant_account_reference_idx` ON `evidence_cases` (`tenant_id`,`account_id`,`case_reference`);--> statement-breakpoint
CREATE TABLE `evidence_media` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`case_id` text NOT NULL,
	`submission_id` text DEFAULT '' NOT NULL,
	`media_type` text NOT NULL,
	`capture_stage` text NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`file_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`byte_size` integer DEFAULT 0 NOT NULL,
	`checksum` text DEFAULT '' NOT NULL,
	`upload_status` text DEFAULT 'Pending upload' NOT NULL,
	`taken_at` text DEFAULT '' NOT NULL,
	`uploaded_by_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `evidence_media_tenant_case_idx` ON `evidence_media` (`tenant_id`,`case_id`);--> statement-breakpoint
CREATE INDEX `evidence_media_tenant_upload_status_idx` ON `evidence_media` (`tenant_id`,`upload_status`);--> statement-breakpoint
CREATE TABLE `evidence_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`case_id` text NOT NULL,
	`submission_id` text NOT NULL,
	`reviewer_email` text NOT NULL,
	`reviewer_role` text NOT NULL,
	`decision` text NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `evidence_reviews_tenant_case_idx` ON `evidence_reviews` (`tenant_id`,`case_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `evidence_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`account_id` text NOT NULL,
	`case_id` text NOT NULL,
	`version` integer NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`snapshot_json` text NOT NULL,
	`submitted_by_email` text NOT NULL,
	`submitted_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `evidence_submissions_tenant_case_version_idx` ON `evidence_submissions` (`tenant_id`,`case_id`,`version`);--> statement-breakpoint
CREATE INDEX `evidence_submissions_tenant_account_status_idx` ON `evidence_submissions` (`tenant_id`,`account_id`,`status`);
-- Data statement omitted during privacy-safe migration.

