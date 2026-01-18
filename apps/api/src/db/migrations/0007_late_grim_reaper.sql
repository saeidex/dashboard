ALTER TABLE `customers` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `employees` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `expenses` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `factories` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `payments` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `categories` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `product_sizes` ADD `deleted_at` integer;