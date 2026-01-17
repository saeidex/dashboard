import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"

import type db from ".."

import * as schema from "../schema"

export async function seedCustomers(database: typeof db, count: number) {
  const data = Array.from({ length: count }, () => ({
    id: createId(),
    name: faker.company.name(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: "international" }),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) || null,
    isActive: faker.datatype.boolean({ probability: 0.9 }),
  }))

  const inserted = await database.insert(schema.customers).values(data).onConflictDoNothing().returning()
  return inserted
}
