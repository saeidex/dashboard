/**
 * Database Seed Script
 *
 * This script seeds the database with sample data for development and testing.
 * Uses Faker.js to generate realistic fake data.
 * Run with: pnpm db:seed
 */

import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"
import { drizzle } from "drizzle-orm/libsql"

import env from "../env"
import * as schema from "./schema"

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
  ordersPerCustomer: { min: 1, max: 5 },
  itemsPerOrder: { min: 1, max: 4 },
  paymentsPerOrder: { min: 0, max: 2 },
}

/* -------------------------------------------------------------------------- */
/*                              Data Generators                               */
/* -------------------------------------------------------------------------- */

// Placeholder 1x1 PNG image
const PLACEHOLDER_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
)

function generateCustomers(count: number) {
  return Array.from({ length: count }, () => ({
    id: createId(),
    name: faker.company.name(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) || null,
    isActive: faker.datatype.boolean({ probability: 0.9 }),
  }))
}

const FABRIC_CATEGORIES = [
  { name: "Cotton Fabrics", description: "Premium cotton materials for various applications" },
  { name: "Silk Collection", description: "Luxurious silk fabrics for high-end garments" },
  { name: "Denim Materials", description: "Durable denim for casual and workwear" },
  { name: "Linen Fabrics", description: "Breathable linen for summer clothing" },
  { name: "Synthetic Blends", description: "Performance fabrics with synthetic materials" },
  { name: "Wool Textiles", description: "Premium wool for winter garments" },
  { name: "Velvet & Velour", description: "Luxurious velvet and velour fabrics" },
  { name: "Chiffon & Georgette", description: "Lightweight flowing fabrics" },
  { name: "Tweed & Herringbone", description: "Classic textured fabrics" },
  { name: "Jersey Knits", description: "Comfortable stretch knit fabrics" },
  { name: "Satin & Sateen", description: "Smooth lustrous fabrics" },
  { name: "Corduroy", description: "Ribbed cotton fabrics" },
]

function generateProductCategories(count: number) {
  const categories = FABRIC_CATEGORIES.slice(0, count)
  return categories.map(cat => ({
    name: cat.name,
    description: cat.description,
    image: PLACEHOLDER_IMAGE,
  }))
}

const SIZE_UNITS = ["XS", "S", "M", "L", "XL", "XXL"] as const

function generateProductSizes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    length: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
    width: faker.number.float({ min: 0.5, max: 2, fractionDigits: 2 }),
    height: faker.number.float({ min: 0.01, max: 0.1, fractionDigits: 3 }),
    unit: SIZE_UNITS[i % SIZE_UNITS.length],
    description: `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(["roll", "swatch", "bolt", "piece"])}`,
  }))
}

const PRODUCT_STATUSES = ["In Stock", "Low Stock", "Out of Stock", "Pre-Order", "Discontinued"]
const PRODUCT_LABELS = ["Best Seller", "New Arrival", "Premium", "Eco-Friendly", "Limited Edition", "Sale", null]

const FABRIC_ADJECTIVES = ["Premium", "Organic", "Luxury", "Classic", "Modern", "Vintage", "Artisan", "Hand-woven", "Machine-made", "Sustainable"]
const FABRIC_TYPES = ["Cotton", "Silk", "Linen", "Wool", "Polyester", "Rayon", "Velvet", "Satin", "Chiffon", "Denim", "Tweed", "Jersey", "Corduroy"]
const FABRIC_SUFFIXES = ["Blend", "Twill", "Weave", "Knit", "Print", "Solid", "Stripe", "Check", "Plaid", "Jacquard"]

function generateProducts(categoryIds: number[], sizeIds: number[], countPerCategory: number) {
  const products: Array<{
    id: string
    title: string
    status: string
    label: string | null
    categoryId: number
    sizeId: number | null
    retailPrice: number
    taxPercentage: number
    taxAmount: number
    total: number
    currency: "BDT"
    stock: number
  }> = []

  for (const categoryId of categoryIds) {
    for (let i = 0; i < countPerCategory; i++) {
      const retailPrice = faker.number.float({ min: 10, max: 200, fractionDigits: 2 })
      const taxPercentage = faker.helpers.arrayElement([0, 5, 7.5, 10, 15])
      const taxAmount = +(retailPrice * (taxPercentage / 100)).toFixed(2)
      const total = +(retailPrice + taxAmount).toFixed(2)

      products.push({
        id: createId(),
        title: `${faker.helpers.arrayElement(FABRIC_ADJECTIVES)} ${faker.helpers.arrayElement(FABRIC_TYPES)} ${faker.helpers.arrayElement(FABRIC_SUFFIXES)}`,
        status: faker.helpers.arrayElement(PRODUCT_STATUSES),
        label: faker.helpers.arrayElement(PRODUCT_LABELS),
        categoryId,
        sizeId: faker.helpers.maybe(() => faker.helpers.arrayElement(sizeIds), { probability: 0.8 }) || null,
        retailPrice,
        taxPercentage,
        taxAmount,
        total,
        currency: "BDT",
        stock: faker.number.int({ min: 0, max: 500 }),
      })
    }
  }

  return products
}

const POSITIONS = [
  "Sourcing Manager",
  "Merchandiser",
  "Quality Assurance Manager",
  "Sample Coordinator",
  "Logistics Coordinator",
  "Fabric Technologist",
  "Compliance Officer",
  "Production Planner",
  "Pattern Master",
  "Supply Chain Executive",
] as const

const SHIFTS = ["Day", "Evening", "Night"] as const
const EMPLOYEE_STATUSES = ["active", "inactive", "on-leave", "terminated"] as const

function generateEmployees(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    return {
      id: createId(),
      firstName,
      lastName,
      employeeId: `EMP-${String(i + 1).padStart(4, "0")}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phoneNumber: faker.phone.number({ style: "international" }),
      position: faker.helpers.arrayElement(POSITIONS),
      shift: faker.helpers.arrayElement(SHIFTS),
      status: faker.helpers.weightedArrayElement([
        { value: "active" as const, weight: 80 },
        { value: "inactive" as const, weight: 5 },
        { value: "on-leave" as const, weight: 10 },
        { value: "terminated" as const, weight: 5 },
      ]),
      salary: faker.number.int({ min: 30000, max: 150000 }),
      hireDate: faker.date.past({ years: 5 }),
    }
  })
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"] as const
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded"] as const
const PAYMENT_METHODS = ["cash", "card", "bank-transfer", "mobile-wallet"] as const

function generateOrders(
  customerIds: string[],
  productData: Array<{ id: string, retailPrice: number, taxAmount: number, total: number }>,
) {
  const orders: Array<{
    customerId: string
    orderStatus: (typeof ORDER_STATUSES)[number]
    paymentStatus: (typeof PAYMENT_STATUSES)[number]
    paymentMethod: (typeof PAYMENT_METHODS)[number]
    currency: "BDT"
    retailPrice: number
    tax: number
    shipping: number
    grandTotal: number
    notes: string | null
    createdAt: Date
    updatedAt: Date
  }> = []

  const orderItems: Array<{
    orderId: number
    productId: string
    quantity: number
    retailPricePerUnit: number
    taxPerUnit: number
    totalRetailPrice: number
    totalTax: number
    grandTotal: number
  }> = []

  let orderIndex = 0

  for (const customerId of customerIds) {
    const orderCount = faker.number.int(CONFIG.ordersPerCustomer)

    for (let o = 0; o < orderCount; o++) {
      orderIndex++
      const itemCount = faker.number.int(CONFIG.itemsPerOrder)
      const selectedProducts = faker.helpers.arrayElements(productData, itemCount)

      let orderRetailPrice = 0
      let orderTax = 0

      const items = selectedProducts.map((product) => {
        const quantity = faker.number.int({ min: 1, max: 10 })
        const totalRetailPrice = +(product.retailPrice * quantity).toFixed(2)
        const totalTax = +(product.taxAmount * quantity).toFixed(2)

        orderRetailPrice += totalRetailPrice
        orderTax += totalTax

        return {
          orderId: orderIndex,
          productId: product.id,
          quantity,
          retailPricePerUnit: product.retailPrice,
          taxPerUnit: product.taxAmount,
          totalRetailPrice,
          totalTax,
          grandTotal: +(totalRetailPrice + totalTax).toFixed(2),
        }
      })

      orderItems.push(...items)

      const shipping = faker.helpers.maybe(() => faker.number.float({ min: 5, max: 50, fractionDigits: 2 }), { probability: 0.3 }) || 0
      const grandTotal = +(orderRetailPrice + orderTax + shipping).toFixed(2)

      const createdAt = faker.date.past({ years: 1 })
      const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

      orders.push({
        customerId,
        orderStatus: faker.helpers.weightedArrayElement([
          { value: "delivered" as const, weight: 40 },
          { value: "shipped" as const, weight: 20 },
          { value: "processing" as const, weight: 15 },
          { value: "pending" as const, weight: 15 },
          { value: "cancelled" as const, weight: 5 },
          { value: "returned" as const, weight: 5 },
        ]),
        paymentStatus: faker.helpers.weightedArrayElement([
          { value: "paid" as const, weight: 50 },
          { value: "unpaid" as const, weight: 25 },
          { value: "partial" as const, weight: 20 },
          { value: "refunded" as const, weight: 5 },
        ]),
        paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
        currency: "BDT",
        retailPrice: +orderRetailPrice.toFixed(2),
        tax: +orderTax.toFixed(2),
        shipping,
        grandTotal,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null,
        createdAt,
        updatedAt,
      })
    }
  }

  return { orders, orderItems }
}

function generatePayments(
  ordersData: Array<{ id: number, customerId: string, grandTotal: number, paymentStatus: string, createdAt: Date }>,
) {
  const payments: Array<{
    orderId: number
    customerId: string
    amount: number
    paymentMethod: (typeof PAYMENT_METHODS)[number]
    currency: "BDT"
    reference: string | null
    notes: string | null
    paidAt: Date
  }> = []

  for (const order of ordersData) {
    // Only generate payments for orders that have some payment
    if (order.paymentStatus === "unpaid")
      continue

    const paymentCount = order.paymentStatus === "paid"
      ? faker.number.int({ min: 1, max: 2 })
      : order.paymentStatus === "partial"
        ? faker.number.int({ min: 1, max: 2 })
        : 1

    let remainingAmount = order.grandTotal

    for (let p = 0; p < paymentCount; p++) {
      const isLastPayment = p === paymentCount - 1
      const amount = isLastPayment && order.paymentStatus === "paid"
        ? remainingAmount
        : order.paymentStatus === "partial"
          ? +(remainingAmount * faker.number.float({ min: 0.3, max: 0.7 })).toFixed(2)
          : remainingAmount

      remainingAmount -= amount

      payments.push({
        orderId: order.id,
        customerId: order.customerId,
        amount: +amount.toFixed(2),
        paymentMethod: faker.helpers.arrayElement(PAYMENT_METHODS),
        currency: "BDT",
        reference: faker.helpers.maybe(() => faker.string.alphanumeric(12).toUpperCase(), { probability: 0.6 }) || null,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || null,
        paidAt: faker.date.between({ from: order.createdAt, to: new Date() }),
      })

      if (remainingAmount <= 0)
        break
    }
  }

  return payments
}

/* -------------------------------------------------------------------------- */
/*                                 Seed Function                              */
/* -------------------------------------------------------------------------- */

async function seed() {
  console.log("🌱 Starting database seed with Faker.js...\n")
  console.log("📊 Configuration:")
  console.log(`   - Customers: ${CONFIG.customers}`)
  console.log(`   - Product Categories: ${CONFIG.productCategories}`)
  console.log(`   - Product Sizes: ${CONFIG.productSizes}`)
  console.log(`   - Products: ~${CONFIG.productCategories * CONFIG.productsPerCategory}`)
  console.log(`   - Employees: ${CONFIG.employees}`)
  console.log(`   - Orders: ~${CONFIG.customers * ((CONFIG.ordersPerCustomer.min + CONFIG.ordersPerCustomer.max) / 2)}`)
  console.log("")

  try {
    // Seed Customers
    console.log("📦 Seeding customers...")
    const customersData = generateCustomers(CONFIG.customers)
    await db.insert(schema.customers).values(customersData).onConflictDoNothing()
    console.log(`   ✓ Inserted ${customersData.length} customers\n`)

    // Seed Product Categories
    console.log("📦 Seeding product categories...")
    const categoriesData = generateProductCategories(CONFIG.productCategories)
    const insertedCategories = await db
      .insert(schema.productCategories)
      .values(categoriesData)
      .onConflictDoNothing()
      .returning()
    console.log(`   ✓ Inserted ${insertedCategories.length} product categories\n`)

    // Seed Product Sizes
    console.log("📦 Seeding product sizes...")
    const sizesData = generateProductSizes(CONFIG.productSizes)
    const insertedSizes = await db
      .insert(schema.productSizes)
      .values(sizesData)
      .onConflictDoNothing()
      .returning()
    console.log(`   ✓ Inserted ${insertedSizes.length} product sizes\n`)

    // Seed Products
    console.log("📦 Seeding products...")
    const categoryIds = insertedCategories.map(c => c.id)
    const sizeIds = insertedSizes.map(s => s.id)

    if (categoryIds.length > 0) {
      const productsData = generateProducts(categoryIds, sizeIds, CONFIG.productsPerCategory)
      await db.insert(schema.products).values(productsData).onConflictDoNothing()
      console.log(`   ✓ Inserted ${productsData.length} products\n`)

      // Seed Orders and Order Items
      console.log("📦 Seeding orders and order items...")
      const customerIds = customersData.map(c => c.id)
      const productDataForOrders = productsData.map(p => ({
        id: p.id,
        retailPrice: p.retailPrice,
        taxAmount: p.taxAmount,
        total: p.total,
      }))

      const { orders, orderItems } = generateOrders(customerIds, productDataForOrders)

      // Insert orders first
      const insertedOrders = await db
        .insert(schema.orders)
        .values(orders)
        .onConflictDoNothing()
        .returning()
      console.log(`   ✓ Inserted ${insertedOrders.length} orders`)

      // Insert order items
      if (orderItems.length > 0) {
        await db.insert(schema.orderItems).values(orderItems).onConflictDoNothing()
        console.log(`   ✓ Inserted ${orderItems.length} order items\n`)
      }

      // Seed Payments
      console.log("📦 Seeding payments...")
      const ordersForPayments = insertedOrders.map(o => ({
        id: o.id,
        customerId: o.customerId,
        grandTotal: o.grandTotal,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      }))

      const paymentsData = generatePayments(ordersForPayments)
      if (paymentsData.length > 0) {
        await db.insert(schema.payments).values(paymentsData).onConflictDoNothing()
        console.log(`   ✓ Inserted ${paymentsData.length} payments\n`)
      }
    }

    // Seed Employees
    console.log("📦 Seeding employees...")
    const employeesData = generateEmployees(CONFIG.employees)
    await db.insert(schema.employees).values(employeesData).onConflictDoNothing()
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
