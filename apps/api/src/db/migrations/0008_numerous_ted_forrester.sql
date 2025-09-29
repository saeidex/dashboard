DROP INDEX `uq_products_product_id`;--> statement-breakpoint
DROP INDEX `uq_products_sku`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `product_id`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `sku`;