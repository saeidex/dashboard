import { faker } from '@faker-js/faker'
import { categories, labels, statuses } from './data'
import { type Product } from './schema'

faker.seed(12345)

export const products: Product[] = Array.from({ length: 20 }, () => {
  const base = parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 }))
  const discountPercentage = faker.number.int({ min: 0, max: 40 }) // up to 40% discount
  const discountAmount = +(base * (discountPercentage / 100)).toFixed(2)
  const discountedBase = +(base - discountAmount).toFixed(2)
  const taxPercentage = faker.number.int({ min: 0, max: 25 })
  const taxAmount = +(discountedBase * (taxPercentage / 100)).toFixed(2)
  const total = +(discountedBase + taxAmount).toFixed(2)
  const pricing = {
    base,
    discountPercentage,
    discountAmount,
    taxPercentage,
    taxAmount,
    total,
    currency: 'BDT' as const,
  }

  return {
    id: faker.string.uuid(),
    productId: `PROD-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.commerce.productName(),
    status: faker.helpers.arrayElement(statuses.map((s) => s.value)),
    label: faker.helpers.arrayElement(labels.map((l) => l.value)),
    categoryId: faker.helpers.arrayElement(categories.map((c) => c.id)),
    pricing,
    price: pricing.total,
    sku: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
    stock: faker.number.int({ min: 0, max: 10 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    brand: faker.company.name(),
  }
})
