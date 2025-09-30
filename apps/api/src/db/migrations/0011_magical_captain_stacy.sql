CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`phone_number` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`role` text DEFAULT 'manager' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_users_user_id` ON `users` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);