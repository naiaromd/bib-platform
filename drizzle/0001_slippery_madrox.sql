CREATE TABLE `partner_monthly_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` text NOT NULL,
	`report_month` text NOT NULL,
	`paid_sessions` integer DEFAULT 0 NOT NULL,
	`package_sessions` integer DEFAULT 0 NOT NULL,
	`complimentary_sessions` integer DEFAULT 0 NOT NULL,
	`gross_revenue` integer DEFAULT 0 NOT NULL,
	`approved_refunds` integer DEFAULT 0 NOT NULL,
	`approved_marketing` integer DEFAULT 0 NOT NULL,
	`opening_hours` integer DEFAULT 0 NOT NULL,
	`closing_hours` integer DEFAULT 0 NOT NULL,
	`consumable_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Submitted' NOT NULL,
	`submitted_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
