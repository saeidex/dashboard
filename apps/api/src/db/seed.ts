/* eslint-disable no-console */
/**
 * Database Seed Script
 *
 * This script seeds the database with sample data for development and testing.
 * Uses Faker.js to generate realistic fake data.
 * Run with: pnpm db:seed
 */

import { faker } from "@faker-js/faker"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/libsql"

import env from "../env"
import * as schema from "./schema"
import { seedCustomers } from "./seeds/customers"
import { seedEmployees } from "./seeds/employees"
import { seedFactories } from "./seeds/factories"
import { seedOrders } from "./seeds/orders"
import { seedPayments } from "./seeds/payments"
import { seedProductCategories } from "./seeds/product-categories"
import { seedProductSizes } from "./seeds/product-sizes"
import { seedProducts } from "./seeds/products"

// Set seed for reproducible data
faker.seed(12345)

const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  casing: "snake_case",
  schema,
})

/* -------------------------------------------------------------------------- */
/*                              Configuration                                 */
/* -------------------------------------------------------------------------- */

const CONFIG = {
  customers: 50,
  productCategories: 10,
  productSizes: 15,
  productsPerCategory: 8,
  employees: 30,
  factories: 10,
  ordersPerCustomer: { min: 1, max: 5 },
  itemsPerOrder: { min: 1, max: 4 },
  paymentsPerOrder: { min: 0, max: 2 },
}

/* -------------------------------------------------------------------------- */
/*                            Drop Tables Function                            */
/* -------------------------------------------------------------------------- */

// Tables to drop (in order to respect foreign key constraints)
// Note: We keep auth tables (user, session, account, verification) intact
const TABLES_TO_DROP = [
  "audit_logs",
  "payments",
  "order_items",
  "orders",
  "products",
  "product_sizes",
  "categories",
  "customers",
  "employees",
  "expenses",
  "factories",
]

async function dropTables() {
  console.log("🗑️  Dropping existing tables (keeping auth tables)...\n")

  // Disable foreign key checks temporarily
  await db.run(sql`PRAGMA foreign_keys = OFF`)

  for (const table of TABLES_TO_DROP) {
    try {
      await db.run(sql.raw(`DELETE FROM ${table}`))
      console.log(`   ✓ Cleared table: ${table}`)
    }
    catch {
      // Table might not exist, which is fine
      console.log(`   ⚠ Table not found or empty: ${table}`)
    }
  }

  // Re-enable foreign key checks
  await db.run(sql`PRAGMA foreign_keys = ON`)
  console.log("")
}

/* -------------------------------------------------------------------------- */
/*                                 Seed Function                              */
/* -------------------------------------------------------------------------- */

async function seed() {
  console.log("🌱 Starting database seed with Faker.js...\n")

  // Drop existing data first
  await dropTables()
  console.log("📊 Configuration:")
  console.log(`   - Customers: ${CONFIG.customers}`)
  console.log(`   - Factories: ${CONFIG.factories}`)
  console.log(`   - Product Categories: ${CONFIG.productCategories}`)
  console.log(`   - Product Sizes: ${CONFIG.productSizes}`)
  console.log(`   - Products: ~${CONFIG.productCategories * CONFIG.productsPerCategory}`)
  console.log(`   - Employees: ${CONFIG.employees}`)
  console.log(`   - Orders: ~${CONFIG.customers * ((CONFIG.ordersPerCustomer.min + CONFIG.ordersPerCustomer.max) / 2)}`)
  console.log("")

  try {
    // Seed Customers
    console.log("📦 Seeding customers...")
    const customersData = await seedCustomers(db, CONFIG.customers)
    console.log(`   ✓ Inserted ${customersData.length} customers\n`)

    // Seed Factories
    console.log("🏭 Seeding factories...")
    const insertedFactories = await seedFactories(db, CONFIG.factories)
    console.log(`   ✓ Inserted ${insertedFactories.length} factories\n`)
    const factoryIds = insertedFactories.map(f => f.id)

    // Seed Product Categories
    console.log("📦 Seeding product categories...")
    const insertedCategories = await seedProductCategories(db, CONFIG.productCategories)
    console.log(`   ✓ Inserted ${insertedCategories.length} product categories\n`)

    // Seed Product Sizes
    console.log("📦 Seeding product sizes...")
    const insertedSizes = await seedProductSizes(db, CONFIG.productSizes)
    console.log(`   ✓ Inserted ${insertedSizes.length} product sizes\n`)

    // Seed Products
    console.log("📦 Seeding products...")
    const categoryIds = insertedCategories.map(c => c.id)
    const sizeIds = insertedSizes.map(s => s.id)

    if (categoryIds.length > 0) {
      const insertedProducts = await seedProducts(db, categoryIds, sizeIds, CONFIG.productsPerCategory)
      console.log(`   ✓ Inserted ${insertedProducts.length} products\n`)

      // Seed Orders and Order Items
      console.log("📦 Seeding orders and order items...")
      const customerIds = customersData.map(c => c.id)
      const productDataForOrders = insertedProducts.map(p => ({
        id: p.id,
        retailPrice: p.retailPrice,
        taxAmount: p.taxAmount,
        total: p.total,
      }))

      const insertedOrders = await seedOrders(db, customerIds, productDataForOrders, factoryIds, {
        ordersPerCustomer: CONFIG.ordersPerCustomer,
        itemsPerOrder: CONFIG.itemsPerOrder,
      })
      console.log(`   ✓ Inserted ${insertedOrders.length} orders`)

      // Seed Payments
      console.log("📦 Seeding payments...")
      const ordersForPayments = insertedOrders.map(o => ({
        id: o.id,
        customerId: o.customerId,
        grandTotal: o.grandTotal,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      }))

      const paymentsData = await seedPayments(db, ordersForPayments)
      console.log(`   ✓ Inserted ${paymentsData.length} payments\n`)
    }

    // Seed Employees
    console.log("📦 Seeding employees...")
    const employeesData = await seedEmployees(db, CONFIG.employees)
    console.log(`   ✓ Inserted ${employeesData.length} employees\n`)

    console.log("✅ Database seeded successfully!\n")
  }
  catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

// Run seed
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
