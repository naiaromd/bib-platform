CREATE TABLE `after_sales_activity_records` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`activity_date` text DEFAULT '' NOT NULL,
	`activity` text NOT NULL,
	`status` text NOT NULL,
	`source_sheet` text NOT NULL,
	`source_row` integer NOT NULL,
	`source_import_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `business_issues` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`due_date` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`source_import_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `company_team_directory` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`responsibility` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`source_import_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kpi_event_records` (
	`id` text PRIMARY KEY NOT NULL,
	`period_key` text NOT NULL,
	`name` text NOT NULL,
	`activity_type` text NOT NULL,
	`target_leads` integer DEFAULT 0 NOT NULL,
	`actual_leads` integer DEFAULT 0 NOT NULL,
	`demos` integer DEFAULT 0 NOT NULL,
	`quotations` integer DEFAULT 0 NOT NULL,
	`potential_sales` integer DEFAULT 0 NOT NULL,
	`closed_sales` integer DEFAULT 0 NOT NULL,
	`follow_up` text DEFAULT '' NOT NULL,
	`status` text NOT NULL,
	`source_sheet` text NOT NULL,
	`source_row` integer NOT NULL,
	`source_import_id` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`source_file_id` text NOT NULL,
	`file_name` text NOT NULL,
	`source_modified_at` text NOT NULL,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`status` text DEFAULT 'Imported' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_activity_records` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_date` text DEFAULT '' NOT NULL,
	`project_name` text NOT NULL,
	`target_segment` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`topic` text NOT NULL,
	`student_count` integer DEFAULT 0 NOT NULL,
	`duration_label` text DEFAULT '' NOT NULL,
	`trainers` text DEFAULT '' NOT NULL,
	`trainer_note` text DEFAULT '' NOT NULL,
	`source_sheet` text NOT NULL,
	`source_row` integer NOT NULL,
	`source_import_id` text NOT NULL
);
