import { faker } from '@faker-js/faker'
import { products } from '@/features/products/data/products'
import { vendors } from '@/features/vendors/data/vendors'
import {
  orderStatusValues,
  paymentMethodValues,
  paymentStatusValues,
} from './data'
import { type Order, type OrderItem, orderSchema } from './schema'

faker.seed(24680)

export const generateOrderItem = (): OrderItem => {
  const product = faker.helpers.arrayElement(products)
  const quantity = faker.number.int({ min: 1, max: 8 })
  const unitPrice = product.pricing.total
  const gross = +(unitPrice * quantity).toFixed(2)
  const discountPercentage = faker.number.int({ min: 0, max: 25 })
  const discountAmount = +(gross * (discountPercentage / 100)).toFixed(2)
  const discounted = +(gross - discountAmount).toFixed(2)
  const taxPercentage = faker.number.int({ min: 0, max: 15 })
  const taxAmount = +(discounted * (taxPercentage / 100)).toFixed(2)
  const subTotal = discounted
  const total = +(subTotal + taxAmount).toFixed(2)
  return {
    id: faker.string.uuid(),
    productId: product.id,
    productTitle: product.title,
    sku: product.sku,
    pricing: {
      unitPrice,
      quantity,
      discountPercentage,
      discountAmount,
      taxPercentage,
      taxAmount,
      subTotal,
      total,
      currency: 'BDT',
    },
  }
}

export const generateOrder = (opts?: { itemsCount?: number }): Order => {
  const customer = faker.helpers.arrayElement(vendors)
  const items = Array.from(
    { length: opts?.itemsCount ?? faker.number.int({ min: 1, max: 6 }) },
    () => generateOrderItem()
  )
  const itemsTotal = +items
    .reduce((acc, i) => acc + i.pricing.subTotal, 0)
    .toFixed(2)
  const itemsTaxTotal = +items
    .reduce((acc, i) => acc + i.pricing.taxAmount, 0)
    .toFixed(2)
  const discountTotal = 0
  const shipping = faker.number.float({ min: 0, max: 20, fractionDigits: 2 })
  const grandTotal = +(
    itemsTotal -
    discountTotal +
    itemsTaxTotal +
    shipping
  ).toFixed(2)
  const createdAt = faker.date.past({ years: 1 })
  const updatedAt = faker.date.recent({ days: 30 })
  return {
    id: faker.string.uuid(),
    orderNumber: `ORD-${faker.number.int({ min: 0, max: 999999 }).toString().padStart(6, '0')}`,
    customerId: customer.id,
    status: faker.helpers.arrayElement(orderStatusValues),
    paymentStatus: faker.helpers.arrayElement(paymentStatusValues),
    paymentMethod: faker.helpers.arrayElement(paymentMethodValues),
    items,
    totals: {
      itemsTotal,
      itemsTaxTotal,
      discountTotal,
      shipping,
      grandTotal,
      currency: 'BDT',
    },
    notes: faker.datatype.boolean({ probability: 0.3 })
      ? faker.lorem.sentence()
      : undefined,
    createdAt,
    updatedAt: updatedAt < createdAt ? createdAt : updatedAt,
  }
}

export const generateOrders = (count = 50): Order[] =>
  Array.from({ length: count }, () => orderSchema.parse(generateOrder()))

export const orders: Order[] = generateOrders(100)
