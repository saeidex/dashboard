PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`style_number` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`label` text,
	`category_id` integer NOT NULL,
	`size_id` integer,
	`retail_price` real DEFAULT 0 NOT NULL,
	`tax_percentage` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'BDT' NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`size_id`) REFERENCES `product_sizes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "style_number", "title", "description", "status", "label", "category_id", "size_id", "retail_price", "tax_percentage", "tax_amount", "total", "currency", "stock", "deleted_at", "created_at", "updated_at") SELECT "id", "style_number", "title", "description", "status", "label", "category_id", "size_id", "retail_price", "tax_percentage", "tax_amount", "total", "currency", "stock", "deleted_at", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_style_number` ON `products` (`style_number`);--> statement-breakpoint
CREATE INDEX `idx_products_category_id` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_size_id` ON `products` (`size_id`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);--> statement-breakpoint
ALTER TABLE `orders` ADD `factory_id` text REFERENCES factories(id);--> statement-breakpoint
ALTER TABLE `orders` ADD `production_stage` text DEFAULT 'orderConfirmDate' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_confirm_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `accessories_inhouse_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `fabric_etd` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `fabric_eta` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `fabric_inhouse_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `pp_sample_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `fabric_test_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_sample_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `sewing_start_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `sewing_complete_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `inspection_start_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `inspection_end_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `ex_factory_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `port_handover_date` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `production_per_line` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `number_of_lines_used` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `manpower_per_line` integer;--> statement-breakpoint
CREATE INDEX `idx_orders_factory_id` ON `orders` (`factory_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_production_stage` ON `orders` (`production_stage`);