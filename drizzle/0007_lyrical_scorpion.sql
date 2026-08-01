ALTER TABLE `client_accounts` ADD `province` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD `temperature` text DEFAULT 'Cold' NOT NULL;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD `evidence_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `crm_leads` ADD `last_contact_at` text DEFAULT '' NOT NULL;