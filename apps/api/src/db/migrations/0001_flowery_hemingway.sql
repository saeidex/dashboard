ALTER TABLE `order_items` DROP COLUMN `additional_discount`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `discount`;--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `additional_discount`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `discount_percentage`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `discount_amount`;