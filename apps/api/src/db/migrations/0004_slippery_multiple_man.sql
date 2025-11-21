ALTER TABLE `order_items` ADD `retail_price_per_unit` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `tax_per_unit` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `total_retail_price` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `total_tax` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` ADD `grand_total` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `order_items` DROP COLUMN `total`;