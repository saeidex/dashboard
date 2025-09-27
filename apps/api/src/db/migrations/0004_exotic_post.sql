ALTER TABLE `product_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`label` text,
	`category_id` text,
	`base_price` real DEFAULT 0 NOT NULL,
	`discount_percentage` real DEFAULT 0 NOT NULL,
	`discount_amount` real DEFAULT 0 NOT NULL,
	`tax_percentage` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'BDT' NOT NULL,
	`sku` text NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "product_id", "title", "status", "label", "category_id", "base_price", "discount_percentage", "discount_amount", "tax_percentage", "tax_amount", "total", "currency", "sku", "stock", "created_at", "updated_at") SELECT "id", "product_id", "title", "status", "label", "category_id", "base_price", "discount_percentage", "discount_amount", "tax_percentage", "tax_amount", "total", "currency", "sku", "stock", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_product_id` ON `products` (`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_sku` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_products_category_id` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);