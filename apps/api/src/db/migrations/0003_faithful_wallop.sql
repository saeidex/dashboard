ALTER TABLE `orders` RENAME COLUMN "base_price" TO "retail_price";--> statement-breakpoint
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
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text NOT NULL,
	`label` text,
	`category_id` text NOT NULL,
	`size_id` integer,
	`retail_price` real DEFAULT 0 NOT NULL,
	`tax_percentage` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'BDT' NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`size_id`) REFERENCES `product_sizes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "title", "status", "label", "category_id", "size_id", "retail_price", "tax_percentage", "tax_amount", "total", "currency", "stock", "created_at", "updated_at") SELECT "id", "title", "status", "label", "category_id", "size_id", "retail_price", "tax_percentage", "tax_amount", "total", "currency", "stock", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_products_category_id` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_size_id` ON `products` (`size_id`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);