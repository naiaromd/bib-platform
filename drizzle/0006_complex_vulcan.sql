CREATE TABLE `crm_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'bib' NOT NULL,
	`account_id` text DEFAULT '' NOT NULL,
	`contact_id` text DEFAULT '' NOT NULL,
	`lead_id` text DEFAULT '' NOT NULL,
	`opportunity_id` text DEFAULT '' NOT NULL,
	`activity_type` text NOT NULL,
	`channel` text DEFAULT '' NOT NULL,
	`summary` text NOT NULL,
	`outcome` text DEFAULT '' NOT NULL,
	`occurred_at` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`source_record_id` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crm_opportunities` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'bib' NOT NULL,
	`account_id` text NOT NULL,
	`primary_contact_id` text DEFAULT '' NOT NULL,
	`owner_user_id` text NOT NULL,
	`name` text NOT NULL,
	`stage` text NOT NULL,
	`commercial_model` text DEFAULT '' NOT NULL,
	`expected_value_satang` integer DEFAULT 0 NOT NULL,
	`probability_bps` integer DEFAULT 0 NOT NULL,
	`expected_close_date` text DEFAULT '' NOT NULL,
	`next_action` text DEFAULT '' NOT NULL,
	`next_action_at` text DEFAULT '' NOT NULL,
	`risk_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demo_appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text DEFAULT 'bib' NOT NULL,
	`lead_id` text NOT NULL,
	`opportunity_id` text DEFAULT '' NOT NULL,
	`location_type` text NOT NULL,
	`site_id` text DEFAULT '' NOT NULL,
	`scheduled_at` text DEFAULT '' NOT NULL,
	`decision_maker_attending` integer DEFAULT false NOT NULL,
	`qualification_score` integer DEFAULT 0 NOT NULL,
	`approval_status` text DEFAULT 'Pending' NOT NULL,
	`status` text DEFAULT 'Requested' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenant_memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`user_email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`account_scope` text DEFAULT '*' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_memberships_tenant_email_idx` ON `tenant_memberships` (`tenant_id`,`user_email`);--> statement-breakpoint
ALTER TABLE `after_sales_activity_records` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `approval_records` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `audit_events` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `business_issues` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_accounts` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `client_contacts` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `company_team_directory` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_orders` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `device_deployments` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `knowledge_entitlements` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `kpi_event_records` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `lead_sources` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_monthly_reports` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `partner_performance_snapshots` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `protocol_records` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `review_comments` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `review_decisions` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `review_documents` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `sales_targets` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `service_events` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `source_imports` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `training_activity_records` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `training_records` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `treatment_menus` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `warranties` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspace_tasks` ADD `tenant_id` text DEFAULT 'bib' NOT NULL;