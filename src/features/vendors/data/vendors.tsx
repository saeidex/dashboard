import { faker } from '@faker-js/faker'

export const vendors = Array.from({ length: 10 }, (_, index) => {
  const vendorId = `VEN${(index + 1).toString().padStart(4, '0')}`
  return {
    vendorId,
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    notes: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    isActive: faker.datatype.boolean({ probability: 0.8 }),
  }
})
