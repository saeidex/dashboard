import { faker } from "@faker-js/faker"

import type db from ".."

import * as schema from "../schema"

const PAYMENT_METHODS = ["cash", "card", "bank-transfer", "mobile-wallet"] as const

export async function seedPayments(
  database: typeof db,
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

  if (payments.length > 0) {
    const inserted = await database.insert(schema.payments).values(payments).onConflictDoNothing().returning()
    return inserted
  }
  return []
}
