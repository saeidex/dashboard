ALTER TABLE `orders` RENAME COLUMN "base_price" TO "retail_price";--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN "base_price" TO "retail_price";--> statement-breakpoint
CREATE TABLE `product_dimensions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`length` real NOT NULL,
	`width` real NOT NULL,
	`height` real NOT NULL,
	`unit` text DEFAULT 'MM' NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `products` ADD `dimension_id` integer REFERENCES product_dimensions(id);--> statement-breakpoint
CREATE INDEX `idx_products_dimension_id` ON `products` (`dimension_id`);--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `dimension`;