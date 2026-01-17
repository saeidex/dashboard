import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"

import type db from ".."

import * as schema from "../schema"

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

export async function seedEmployees(database: typeof db, count: number) {
  const data = Array.from({ length: count }, (_, i) => {
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

  const inserted = await database.insert(schema.employees).values(data).onConflictDoNothing().returning()
  return inserted
}
