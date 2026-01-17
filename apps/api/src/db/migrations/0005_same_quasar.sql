ALTER TABLE `product_dimensions` RENAME TO `product_sizes`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN "dimension_id" TO "size_id";--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action_type` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`order_id` integer,
	`customer_id` text,
	`description` text NOT NULL,
	`metadata` text,
	`performed_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_action_type` ON `audit_logs` (`action_type`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_entity_type` ON `audit_logs` (`entity_type`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_order_id` ON `audit_logs` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_customer_id` ON `audit_logs` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_created_at` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `factories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`address` text,
	`city` text,
	`country` text DEFAULT 'Bangladesh',
	`contact_person` text,
	`phone` text,
	`email` text,
	`capacity` integer DEFAULT 0,
	`total_lines` integer DEFAULT 0,
	`max_manpower` integer DEFAULT 0,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_factories_status` ON `factories` (`status`);--> statement-breakpoint
CREATE INDEX `idx_factories_code` ON `factories` (`code`);--> statement-breakpoint
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
DROP INDEX "idx_audit_logs_action_type";--> statement-breakpoint
DROP INDEX "idx_audit_logs_entity_type";--> statement-breakpoint
DROP INDEX "idx_audit_logs_order_id";--> statement-breakpoint
DROP INDEX "idx_audit_logs_customer_id";--> statement-breakpoint
DROP INDEX "idx_audit_logs_created_at";--> statement-breakpoint
DROP INDEX "sessions_token_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "uq_employees_employee_id";--> statement-breakpoint
DROP INDEX "idx_employees_email";--> statement-breakpoint
DROP INDEX "idx_expenses_category";--> statement-breakpoint
DROP INDEX "idx_factories_status";--> statement-breakpoint
DROP INDEX "idx_factories_code";--> statement-breakpoint
DROP INDEX "idx_order_items_order_id";--> statement-breakpoint
DROP INDEX "idx_order_items_product_id";--> statement-breakpoint
DROP INDEX "idx_orders_customer_id";--> statement-breakpoint
DROP INDEX "idx_orders_order_status";--> statement-breakpoint
DROP INDEX "idx_orders_payment_status";--> statement-breakpoint
DROP INDEX "idx_payments_order_id";--> statement-breakpoint
DROP INDEX "idx_payments_customer_id";--> statement-breakpoint
DROP INDEX "idx_payments_paid_at";--> statement-breakpoint
DROP INDEX "uq_products_style_number";--> statement-breakpoint
DROP INDEX "idx_products_category_id";--> statement-breakpoint
DROP INDEX "idx_products_size_id";--> statement-breakpoint
DROP INDEX "idx_products_status";--> statement-breakpoint
ALTER TABLE `product_sizes` ALTER COLUMN "length" TO "length" real;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_employees_employee_id` ON `employees` (`employee_id`);--> statement-breakpoint
CREATE INDEX `idx_employees_email` ON `employees` (`email`);--> statement-breakpoint
CREATE INDEX `idx_expenses_category` ON `expenses` (`category`);--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_items_product_id` ON `order_items` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_id` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_order_status` ON `orders` (`order_status`);--> statement-breakpoint
CREATE INDEX `idx_orders_payment_status` ON `orders` (`payment_status`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_products_style_number` ON `products` (`style_number`);--> statement-breakpoint
CREATE INDEX `idx_products_category_id` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_products_size_id` ON `products` (`size_id`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);--> statement-breakpoint
ALTER TABLE `product_sizes` ALTER COLUMN "width" TO "width" real;--> statement-breakpoint
ALTER TABLE `product_sizes` ALTER COLUMN "height" TO "height" real;--> statement-breakpoint
ALTER TABLE `product_sizes` ALTER COLUMN "unit" TO "unit" text NOT NULL DEFAULT 'M';--> statement-breakpoint
DROP INDEX `idx_products_dimension_id`;--> statement-breakpoint
ALTER TABLE `products` ADD `style_number` text NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `description` text;--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "size_id" TO "size_id" integer REFERENCES product_sizes(id) ON DELETE no action ON UPDATE no action;