import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const employees = Array.from({ length: 500 }, (_, index) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const employeeId = `EMP${(index + 1).toString().padStart(4, '0')}`

  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    employeeId,
    position: faker.helpers.arrayElement([
      'Commercial Manager',
      'Manager',
      'Production Manager',
      'Corrugation Operator',
      'Crease Operator',
      'Pasting Operator',
      'Printing Master',
      'Stitching Operator',
      'Flexo Operator',
      'Cutting Man',
      'Delivery Man',
      'Helper',
    ]),
    shift: faker.helpers.arrayElement(['Day', 'Evening', 'Night']),
    salary: faker.number.float({ min: 15000, max: 35000, fractionDigits: 2 }),
    status: faker.helpers.arrayElement([
      'active',
      'inactive',
      'on-leave',
      'terminated',
    ]),
    hireDate: faker.date.past({ years: 10 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
