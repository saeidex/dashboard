import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(12345)

export const products = Array.from({ length: 100 }, () => {
  const statuses = [
    'available',
    'out-of-stock',
    'coming-soon',
    'discontinued',
  ] as const
  const labels = ['new', 'premium'] as const
  const categories = [
    'electronics',
    'clothing',
    'home-garden',
    'featured',
  ] as const

  return {
    id: `PROD-${faker.number.int({ min: 1000, max: 9999 })}`,
    title: faker.commerce.productName(),
    status: faker.helpers.arrayElement(statuses),
    label: faker.helpers.arrayElement(labels),
    category: faker.helpers.arrayElement(categories),
    price: parseFloat(faker.commerce.price()),
    sku: faker.string.alphanumeric({ length: 8 }).toUpperCase(),
    stock: faker.number.int({ min: 0, max: 1000 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    description: faker.commerce.productDescription(),
    brand: faker.company.name(),
    weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
  }
})
