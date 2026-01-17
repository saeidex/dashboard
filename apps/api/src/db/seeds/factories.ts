import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"

import type db from ".."

import * as schema from "../schema"

const FACTORY_NAMES = [
  "Rajdhani Apparels",
  "Green Valley Garments",
  "Excel Textiles Ltd",
  "Prime Fashion House",
  "Royal Dress Manufacturing",
  "Golden Thread Industries",
  "Sunrise Garments",
  "Pacific Knitwear",
  "Elite Clothing Co",
  "Fashion Forward Ltd",
  "Diamond Garments",
  "Star Textiles",
]

const BD_CITIES = ["Dhaka", "Gazipur", "Narayanganj", "Chittagong", "Savar", "Tongi", "Ashulia", "Mirpur"]

export async function seedFactories(database: typeof db, count: number) {
  const data = Array.from({ length: count }, (_, i) => {
    const name = FACTORY_NAMES[i] || `${faker.company.name()} Garments`
    const city = faker.helpers.arrayElement(BD_CITIES)
    return {
      id: createId(),
      name,
      code: `FAC-${String(i + 1).padStart(3, "0")}`,
      address: faker.location.streetAddress(),
      city,
      country: "Bangladesh",
      contactPerson: faker.person.fullName(),
      phone: faker.phone.number({ style: "international" }),
      email: faker.internet.email({ firstName: name.split(" ")[0], lastName: "factory" }).toLowerCase(),
      capacity: faker.number.int({ min: 500, max: 5000 }),
      totalLines: faker.number.int({ min: 2, max: 15 }),
      maxManpower: faker.number.int({ min: 50, max: 500 }),
      status: faker.helpers.weightedArrayElement([
        { value: "active" as const, weight: 85 },
        { value: "inactive" as const, weight: 10 },
        { value: "suspended" as const, weight: 5 },
      ]),
      notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }) || null,
    }
  })

  const inserted = await database.insert(schema.factories).values(data).onConflictDoNothing().returning()
  return inserted
}
