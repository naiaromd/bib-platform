CREATE TABLE IF NOT EXISTS `client_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`legal_name` text NOT NULL,
	`display_name` text NOT NULL,
	`business_segment` text NOT NULL,
	`commercial_model` text NOT NULL,
	`account_status` text DEFAULT 'Active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `client_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`buying_role` text NOT NULL,
	`portal_role` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `crm_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text DEFAULT '' NOT NULL,
	`contact_id` text DEFAULT '' NOT NULL,
	`source_id` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`status` text NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`next_action` text DEFAULT '' NOT NULL,
	`next_action_at` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `customer_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`order_type` text NOT NULL,
	`status` text NOT NULL,
	`total_amount` integer DEFAULT 0 NOT NULL,
	`quotation_document_id` text DEFAULT '' NOT NULL,
	`ordered_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `device_deployments` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`model` text NOT NULL,
	`serial_number` text DEFAULT '' NOT NULL,
	`installed_at` text DEFAULT '' NOT NULL,
	`cumulative_hours` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Pending delivery' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `knowledge_entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`commercial_model` text NOT NULL,
	`resource_code` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `lead_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`source_type` text NOT NULL,
	`name` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`end_date` text DEFAULT '' NOT NULL,
	`budget` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `protocol_records` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`approved_protocol_code` text NOT NULL,
	`preparation_text` text DEFAULT '' NOT NULL,
	`follow_up_text` text DEFAULT '' NOT NULL,
	`internal_note` text DEFAULT '' NOT NULL,
	`locked_clinical_data` text DEFAULT '{}' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sales_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`period_key` text NOT NULL,
	`metric_code` text NOT NULL,
	`target_value` integer DEFAULT 0 NOT NULL,
	`actual_value` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_events` (
	`id` text PRIMARY KEY NOT NULL,
	`deployment_id` text NOT NULL,
	`event_type` text NOT NULL,
	`status` text NOT NULL,
	`scheduled_at` text DEFAULT '' NOT NULL,
	`completed_at` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `training_records` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`course_code` text NOT NULL,
	`completed_at` text DEFAULT '' NOT NULL,
	`competency_status` text DEFAULT 'Scheduled' NOT NULL,
	`certificate_document_id` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `treatment_menus` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`service_name` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`price` integer NOT NULL,
	`customer_description` text DEFAULT '' NOT NULL,
	`protocol_id` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `warranties` (
	`id` text PRIMARY KEY NOT NULL,
	`deployment_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`status` text NOT NULL,
	`document_version_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `workspace_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`account_id` text DEFAULT '' NOT NULL,
	`lead_id` text DEFAULT '' NOT NULL,
	`source_id` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'ยังไม่เริ่ม' NOT NULL,
	`priority` text DEFAULT 'กลาง' NOT NULL,
	`due_date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
