import { faker } from "@faker-js/faker"

import type db from ".."

import * as schema from "../schema"

const SIZE_UNITS = ["XS", "S", "M", "L", "XL", "XXL"] as const

export async function seedProductSizes(database: typeof db, count: number) {
  const data = Array.from({ length: count }, (_, i) => ({
    length: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
    width: faker.number.float({ min: 0.5, max: 2, fractionDigits: 2 }),
    height: faker.number.float({ min: 0.01, max: 0.1, fractionDigits: 3 }),
    unit: SIZE_UNITS[i % SIZE_UNITS.length],
    description: `${faker.commerce.productAdjective()} ${faker.helpers.arrayElement(["roll", "swatch", "bolt", "piece"])}`,
  }))

  const inserted = await database
    .insert(schema.productSizes)
    .values(data)
    .onConflictDoNothing()
    .returning()
  return inserted
}
