import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"

import type db from ".."

import * as schema from "../schema"

const PRODUCT_STATUSES = ["In Stock", "Low Stock", "Out of Stock", "Pre-Order", "Discontinued"]
const PRODUCT_LABELS = ["Best Seller", "New Arrival", "Premium", "Eco-Friendly", "Limited Edition", "Sale", null]

const FABRIC_ADJECTIVES = ["Premium", "Organic", "Luxury", "Classic", "Modern", "Vintage", "Artisan", "Hand-woven", "Machine-made", "Sustainable"]
const FABRIC_TYPES = ["Cotton", "Silk", "Linen", "Wool", "Polyester", "Rayon", "Velvet", "Satin", "Chiffon", "Denim", "Tweed", "Jersey", "Corduroy"]
const FABRIC_SUFFIXES = ["Blend", "Twill", "Weave", "Knit", "Print", "Solid", "Stripe", "Check", "Plaid", "Jacquard"]

// Style number counter for generating unique style numbers
let styleNumberCounter = 54540

export async function seedProducts(
  database: typeof db,
  categoryIds: number[],
  sizeIds: number[],
  countPerCategory: number,
) {
  const products: Array<{
    id: string
    styleNumber: string
    title: string
    description: string | null
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
        styleNumber: String(styleNumberCounter++),
        title: `${faker.helpers.arrayElement(FABRIC_ADJECTIVES)} ${faker.helpers.arrayElement(FABRIC_TYPES)} ${faker.helpers.arrayElement(FABRIC_SUFFIXES)}`,
        description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) || null,
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

  const inserted = await database.insert(schema.products).values(products).returning()
  return inserted
}
