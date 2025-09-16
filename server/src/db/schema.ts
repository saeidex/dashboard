import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

/* -------------------------------------------------------------------------- */
/*                                Product Categories                          */
/* -------------------------------------------------------------------------- */

export const productCategories = sqliteTable("product_categories", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  image: text().notNull(),
});

export const selectProductCategoriesSchema = toZodV4SchemaTyped(createSelectSchema(productCategories));

export const insertProductCategoriesSchema = toZodV4SchemaTyped(createInsertSchema(productCategories).omit({ id: true }));

// @ts-expect-error partial exists on zod v4 type
export const patchProductCategoriesSchema = insertProductCategoriesSchema.partial();

/* -------------------------------------------------------------------------- */
/*                                   Products                                 */
/* -------------------------------------------------------------------------- */

export const products = sqliteTable("products", {
  id: text().primaryKey().$defaultFn(createId),
  productId: text().notNull(),
  title: text().notNull(),
  status: text().notNull(),
  label: text(),
  categoryId: text().references(() => productCategories.id),
  base: real().notNull().default(0),
  discountPercentage: real().notNull().default(0),
  discountAmount: real().notNull().default(0),
  taxPercentage: real().notNull().default(0),
  taxAmount: real().notNull().default(0),
  total: real().notNull().default(0),
  currency: text().notNull().default("BDT"),
  sku: text().notNull(),
  stock: integer({ mode: "number" }).notNull().default(0),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_products_product_id").on(table.productId),
  uniqueIndex("uq_products_sku").on(table.sku),
  index("idx_products_category_id").on(table.categoryId),
  index("idx_products_status").on(table.status),
]);

export const selectProductsSchema = toZodV4SchemaTyped(createSelectSchema(products));

export const insertProductsSchema = toZodV4SchemaTyped(createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchProductsSchema = insertProductsSchema.partial();

/* -------------------------------------------------------------------------- */
/*                                 Employees                                  */
/* -------------------------------------------------------------------------- */

export const employees = sqliteTable("employees", {
  id: text().primaryKey().$defaultFn(createId),
  firstName: text().notNull(),
  lastName: text().notNull(),
  employeeId: text().notNull(),
  email: text().notNull(),
  phoneNumber: text().notNull(),
  position: text().notNull(),
  shift: text().notNull(),
  salary: real().notNull(),
  status: text().notNull(),
  hireDate: integer({ mode: "timestamp" }).notNull(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_employees_employee_id").on(table.employeeId),
  index("idx_employees_email").on(table.email),
]);

export const selectEmployeesSchema = toZodV4SchemaTyped(createSelectSchema(employees));

export const insertEmployeesSchema = toZodV4SchemaTyped(createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchEmployeesSchema = insertEmployeesSchema.partial();

/* -------------------------------------------------------------------------- */
/*                                   Vendors                                  */
/* -------------------------------------------------------------------------- */

export const vendors = sqliteTable("vendors", {
  id: text().primaryKey().$defaultFn(createId),
  vendorId: text().notNull(),
  name: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  address: text(),
  city: text(),
  notes: text(),
  isActive: integer({ mode: "boolean" }).notNull().default(true),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_vendors_vendor_id").on(table.vendorId),
]);

export const selectVendorsSchema = toZodV4SchemaTyped(createSelectSchema(vendors));

export const insertVendorsSchema = toZodV4SchemaTyped(createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchVendorsSchema = insertVendorsSchema.partial();

/* -------------------------------------------------------------------------- */
/*                                   Expenses                                  */
/* -------------------------------------------------------------------------- */

export const expenses = sqliteTable("expenses", {
  id: text().primaryKey().$defaultFn(createId),
  title: text().notNull(),
  category: text().notNull().default("other"),
  amount: real().notNull(),
  currency: text().notNull().default("BDT"),
  referenceId: text(),
  notes: text(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_expenses_category").on(table.category),
]);

export const selectExpensesSchema = toZodV4SchemaTyped(createSelectSchema(expenses));

export const insertExpensesSchema = toZodV4SchemaTyped(createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchExpensesSchema = insertExpensesSchema.partial();

/* -------------------------------------------------------------------------- */
/*                                   Orders                                   */
/* -------------------------------------------------------------------------- */

export const orders = sqliteTable("orders", {
  id: text().primaryKey().$defaultFn(createId),
  orderNumber: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  customerId: text().notNull(),
  status: text().notNull().default("pending"),
  paymentStatus: text().notNull().default("unpaid"),
  paymentMethod: text(),
  itemsTotal: real().notNull().default(0),
  itemsTaxTotal: real().notNull().default(0),
  discountTotal: real().notNull().default(0),
  shipping: real().notNull().default(0),
  grandTotal: real().notNull().default(0),
  currency: text().notNull().default("BDT"),
  notes: text(),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  uniqueIndex("uq_orders_order_number").on(table.orderNumber),
  index("idx_orders_customer_id").on(table.customerId),
  index("idx_orders_status").on(table.status),
  index("idx_orders_payment_status").on(table.paymentStatus),
]);

export const selectOrdersSchema = toZodV4SchemaTyped(createSelectSchema(orders));

export const insertOrdersSchema = toZodV4SchemaTyped(createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchOrdersSchema = insertOrdersSchema.partial();

export const orderItems = sqliteTable("order_items", {
  id: text().primaryKey().$defaultFn(createId),
  orderId: text().notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text().notNull().references(() => products.id),
  productTitle: text().notNull(),
  sku: text().notNull(),
  unitPrice: real().notNull().default(0),
  quantity: integer({ mode: "number" }).notNull().default(1),
  discountPercentage: real().notNull().default(0),
  discountAmount: real().notNull().default(0),
  taxPercentage: real().notNull().default(0),
  taxAmount: real().notNull().default(0),
  subTotal: real().notNull().default(0),
  total: real().notNull().default(0),
  currency: text().notNull().default("BDT"),
  createdAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
}, table => [
  index("idx_order_items_order_id").on(table.orderId),
  index("idx_order_items_product_id").on(table.productId),
  index("idx_order_items_sku").on(table.sku),
]);

export const selectOrderItemsSchema = toZodV4SchemaTyped(createSelectSchema(orderItems));

export const insertOrderItemsSchema = toZodV4SchemaTyped(createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}));

export const patchOrderItemsSchema = toZodV4SchemaTyped(createInsertSchema(orderItems).omit({
  id: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
}).partial());
