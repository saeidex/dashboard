CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` integer NOT NULL,
	`customer_id` text NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text DEFAULT 'cash' NOT NULL,
	`currency` text DEFAULT 'BDT' NOT NULL,
	`reference` text,
	`notes` text,
	`paid_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_payments_order_id` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_customer_id` ON `payments` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_paid_at` ON `payments` (`paid_at`);--> statement-breakpoint
CREATE TABLE `product_sizes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`length` real,
	`width` real,
	`height` real,
	`unit` text DEFAULT 'M' NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `product_dimensions`;--> statement-breakpoint
DROP INDEX `idx_products_dimension_id`;--> statement-breakpoint
ALTER TABLE `products` ADD `size_id` integer REFERENCES product_sizes(id);--> statement-breakpoint
CREATE INDEX `idx_products_size_id` ON `products` (`size_id`);--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `dimension_id`;