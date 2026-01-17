import { faker } from "@faker-js/faker"

import type db from ".."

import * as schema from "../schema"

// eslint-disable-next-line unused-imports/no-unused-vars
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"] as const
// eslint-disable-next-line unused-imports/no-unused-vars
const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded"] as const
const PAYMENT_METHODS = ["cash", "card", "bank-transfer", "mobile-wallet"] as const

interface OrderConfig {
  ordersPerCustomer: { min: number, max: number }
  itemsPerOrder: { min: number, max: number }
}

export async function seedOrders(
  database: typeof db,
  customerIds: string[],
  productData: Array<{ id: string, retailPrice: number, taxAmount: number, total: number }>,
  factoryIds: string[],
  config: OrderConfig,
) {
  const orders: Array<{
    customerId: string
    factoryId: string | null
    orderStatus: (typeof ORDER_STATUSES)[number]
    paymentStatus: (typeof PAYMENT_STATUSES)[number]
    paymentMethod: (typeof PAYMENT_METHODS)[number]
    productionStage: schema.ProductionStage
    currency: "BDT"
    retailPrice: number
    tax: number
    shipping: number
    grandTotal: number
    notes: string | null
    // Timeline dates
    orderConfirmDate: Date | null
    accessoriesInhouseDate: Date | null
    fabricEtd: Date | null
    fabricEta: Date | null
    fabricInhouseDate: Date | null
    ppSampleDate: Date | null
    fabricTestDate: Date | null
    shippingSampleDate: Date | null
    sewingStartDate: Date | null
    sewingCompleteDate: Date | null
    inspectionStartDate: Date | null
    inspectionEndDate: Date | null
    exFactoryDate: Date | null
    portHandoverDate: Date | null
    // Production metrics
    productionPerLine: number | null
    numberOfLinesUsed: number | null
    manpowerPerLine: number | null
    createdAt: Date
    updatedAt: Date
  }> = []

  const orderItemsByOrderIndex: Record<number, Array<{
    productId: string
    quantity: number
    retailPricePerUnit: number
    taxPerUnit: number
    totalRetailPrice: number
    totalTax: number
    grandTotal: number
  }>> = {}

  let orderIndex = 0

  for (const customerId of customerIds) {
    const orderCount = faker.number.int(config.ordersPerCustomer)

    for (let o = 0; o < orderCount; o++) {
      const itemCount = faker.number.int(config.itemsPerOrder)
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
          productId: product.id,
          quantity,
          retailPricePerUnit: product.retailPrice,
          taxPerUnit: product.taxAmount,
          totalRetailPrice,
          totalTax,
          grandTotal: +(totalRetailPrice + totalTax).toFixed(2),
        }
      })

      orderItemsByOrderIndex[orderIndex] = items
      orderIndex++

      const shipping = faker.helpers.maybe(() => faker.number.float({ min: 5, max: 50, fractionDigits: 2 }), { probability: 0.3 }) || 0
      const grandTotal = +(orderRetailPrice + orderTax + shipping).toFixed(2)

      const createdAt = faker.date.past({ years: 1 })
      const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

      // Generate production stage based on weighted distribution
      const productionStage = faker.helpers.weightedArrayElement([
        { value: "orderConfirmDate" as const, weight: 10 },
        { value: "accessoriesInhouseDate" as const, weight: 10 },
        { value: "fabricEtd" as const, weight: 10 },
        { value: "fabricEta" as const, weight: 8 },
        { value: "fabricInhouseDate" as const, weight: 8 },
        { value: "ppSampleDate" as const, weight: 7 },
        { value: "fabricTestDate" as const, weight: 7 },
        { value: "shippingSampleDate" as const, weight: 6 },
        { value: "sewingStartDate" as const, weight: 10 },
        { value: "sewingCompleteDate" as const, weight: 8 },
        { value: "inspectionStartDate" as const, weight: 5 },
        { value: "inspectionEndDate" as const, weight: 4 },
        { value: "exFactoryDate" as const, weight: 3 },
        { value: "portHandoverDate" as const, weight: 2 },
      ]) as schema.ProductionStage

      // Assign a factory (80% chance)
      const factoryId = faker.helpers.maybe(() => faker.helpers.arrayElement(factoryIds), { probability: 1 }) || null

      // Generate timeline dates based on order created date
      const orderConfirmDate = new Date(createdAt)
      const accessoriesInhouseDate = faker.date.between({ from: orderConfirmDate, to: new Date(orderConfirmDate.getTime() + 45 * 24 * 60 * 60 * 1000) })
      const fabricEtd = faker.date.between({ from: orderConfirmDate, to: new Date(orderConfirmDate.getTime() + 30 * 24 * 60 * 60 * 1000) })
      const fabricEta = faker.date.between({ from: fabricEtd, to: new Date(fabricEtd.getTime() + 25 * 24 * 60 * 60 * 1000) })
      const fabricInhouseDate = faker.date.between({ from: fabricEta, to: new Date(fabricEta.getTime() + 15 * 24 * 60 * 60 * 1000) })
      const ppSampleDate = faker.date.between({ from: fabricInhouseDate, to: new Date(fabricInhouseDate.getTime() + 10 * 24 * 60 * 60 * 1000) })
      const fabricTestDate = faker.date.between({ from: ppSampleDate, to: new Date(ppSampleDate.getTime() + 5 * 24 * 60 * 60 * 1000) })
      const shippingSampleDate = faker.date.between({ from: fabricTestDate, to: new Date(fabricTestDate.getTime() + 7 * 24 * 60 * 60 * 1000) })
      const sewingStartDate = faker.date.between({ from: shippingSampleDate, to: new Date(shippingSampleDate.getTime() + 7 * 24 * 60 * 60 * 1000) })
      const sewingCompleteDate = faker.date.between({ from: sewingStartDate, to: new Date(sewingStartDate.getTime() + 40 * 24 * 60 * 60 * 1000) })
      const inspectionStartDate = faker.date.between({ from: sewingStartDate, to: sewingCompleteDate })
      const inspectionEndDate = faker.date.between({ from: inspectionStartDate, to: new Date(sewingCompleteDate.getTime() + 5 * 24 * 60 * 60 * 1000) })
      const exFactoryDate = faker.date.between({ from: inspectionEndDate, to: new Date(inspectionEndDate.getTime() + 5 * 24 * 60 * 60 * 1000) })
      const portHandoverDate = faker.date.between({ from: exFactoryDate, to: new Date(exFactoryDate.getTime() + 3 * 24 * 60 * 60 * 1000) })

      // Production metrics
      const productionPerLine = faker.number.int({ min: 800, max: 1500 })
      const numberOfLinesUsed = faker.number.int({ min: 1, max: 4 })
      const manpowerPerLine = faker.number.int({ min: 30, max: 60 })

      orders.push({
        customerId,
        factoryId,
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
        productionStage,
        currency: "BDT",
        retailPrice: +orderRetailPrice.toFixed(2),
        tax: +orderTax.toFixed(2),
        shipping,
        grandTotal,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || null,
        // Timeline dates
        orderConfirmDate,
        accessoriesInhouseDate,
        fabricEtd,
        fabricEta,
        fabricInhouseDate,
        ppSampleDate,
        fabricTestDate,
        shippingSampleDate,
        sewingStartDate,
        sewingCompleteDate,
        inspectionStartDate,
        inspectionEndDate,
        exFactoryDate,
        portHandoverDate,
        // Production metrics
        productionPerLine,
        numberOfLinesUsed,
        manpowerPerLine,
        createdAt,
        updatedAt,
      })
    }
  }

  const insertedOrders: any[] = []
  const allOrderItems: any[] = []

  let currentOrderIdx = 0
  for (const orderData of orders) {
    const [insertedOrder] = await database
      .insert(schema.orders)
      .values(orderData)
      .returning()

    if (insertedOrder) {
      insertedOrders.push(insertedOrder)
      const items = orderItemsByOrderIndex[currentOrderIdx]
      if (items) {
        allOrderItems.push(...items.map(item => ({ ...item, orderId: insertedOrder.id })))
      }
    }
    currentOrderIdx++
  }

  // Insert order items
  if (allOrderItems.length > 0) {
    await database.insert(schema.orderItems).values(allOrderItems)
  }

  return insertedOrders
}
