CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`actor_role` text NOT NULL,
	`event_type` text NOT NULL,
	`event_data` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`account_scope` text DEFAULT '*' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `portal_users_email_idx` ON `portal_users` (`email`);--> statement-breakpoint
CREATE TABLE `review_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`author_email` text NOT NULL,
	`author_label` text NOT NULL,
	`role` text NOT NULL,
	`body` text NOT NULL,
	`visibility` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_decisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` text NOT NULL,
	`version` text NOT NULL,
	`actor_email` text NOT NULL,
	`actor_role` text NOT NULL,
	`decision` text NOT NULL,
	`condition_text` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `review_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`account` text NOT NULL,
	`title` text NOT NULL,
	`model` text NOT NULL,
	`version` text NOT NULL,
	`stage` text NOT NULL,
	`risk` text NOT NULL,
	`owner` text NOT NULL,
	`customer_visible` integer DEFAULT false NOT NULL,
	`decision` text DEFAULT 'Pending' NOT NULL,
	`version_hash` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_documents_version_idx` ON `review_documents` (`id`,`version`);