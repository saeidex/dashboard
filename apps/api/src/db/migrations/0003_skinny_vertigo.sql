ALTER TABLE `products` RENAME COLUMN "base" TO "base_price";--> statement-breakpoint
DROP INDEX "uq_employees_employee_id";--> statement-breakpoint
DROP INDEX "idx_employees_email";--> statement-breakpoint
DROP INDEX "idx_expenses_category";--> statement-breakpoint
DROP INDEX "idx_order_items_order_id";--> statement-breakpoint
DROP INDEX "idx_order_items_product_id";--> statement-breakpoint
DROP INDEX "idx_order_items_sku";--> statement-breakpoint
DROP INDEX "idx_orders_customer_id";--> statement-breakpoint
DROP INDEX "idx_orders_status";--> statement-breakpoint
DROP INDEX "idx_orders_payment_status";--> statement-breakpoint
DROP INDEX "uq_products_product_id";--> statement-breakpoint
DROP INDEX "uq_products_sku";--> statement-breakpoint
DROP INDEX "idx_products_category_id";--> statement-breakpoint
DROP INDEX "idx_products_status";--> statement-breakpoint
DROP INDEX "uq_vendors_vendor_id";--> statement-breakpoint
ALTER TABLE `employees` ALTER COLUMN "hire_date" TO "hire_date" integer;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_employees_employee_id` ON `employees` (`employee_id`);--> statement-breakpoint
CREATE INDEX `idx_employees_email` ON `employees` (`email`);--> statement-breakpoint
CREATE INDEX `idx_expenses_category` ON `expenses` (`category`);--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_product_id` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_sku` ON `order_items` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_id` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_orders_payment_status` ON `orders` (`payment_status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_product_id` ON `products` (`product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_sku` ON `products` (`sku`);--> statement-breakpoint
CREATE INDEX `idx_products_category_id` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_vendors_vendor_id` ON `vendors` (`vendor_id`);