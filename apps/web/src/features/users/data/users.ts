import { faker } from "@faker-js/faker";

// Set a fixed seed for consistent data generation
faker.seed(67890);

export const users = Array.from({ length: 500 }, () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const userId = `${firstName.charAt(0).toUpperCase()}${lastName.toUpperCase()}${faker.number.int({ min: 10, max: 99 })}`;

  return {
    id         : faker.string.uuid(),
    firstName,
    lastName,
    userId,
    email      : faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: "international" }),
    role       : faker.helpers.arrayElement(["superadmin", "admin", "manager"]),
    createdAt  : faker.date.past(),
    updatedAt  : faker.date.recent(),
  };
});
