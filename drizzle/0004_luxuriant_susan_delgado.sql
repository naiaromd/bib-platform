CREATE TABLE `approval_records` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`document_version` text NOT NULL,
	`version_hash` text NOT NULL,
	`actor_email` text NOT NULL,
	`actor_role` text NOT NULL,
	`decision` text NOT NULL,
	`approval_scope` text DEFAULT 'Internal workflow' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `document_template_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`module_key` text NOT NULL,
	`template_code` text NOT NULL,
	`name` text NOT NULL,
	`approval_workflow` text NOT NULL,
	`current_version` text DEFAULT '1.0' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `field_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`module_key` text NOT NULL,
	`field_key` text NOT NULL,
	`label` text NOT NULL,
	`field_type` text NOT NULL,
	`required` integer DEFAULT false NOT NULL,
	`options_json` text DEFAULT '[]' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `module_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`module_key` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_template_registry` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`module_key` text NOT NULL,
	`name` text NOT NULL,
	`default_owner_role` text NOT NULL,
	`due_offset_days` integer DEFAULT 0 NOT NULL,
	`trigger_event` text DEFAULT 'Manual' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenant_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand_code` text NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workflow_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`module_key` text NOT NULL,
	`workflow_code` text NOT NULL,
	`name` text NOT NULL,
	`steps_json` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
