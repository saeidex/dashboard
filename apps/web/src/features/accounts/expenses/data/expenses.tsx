import { faker } from "@faker-js/faker";

import type { Expense } from "./schema";

import { expenseCategorySchema } from "./schema";

faker.seed(24680);

const categories = expenseCategorySchema.options;

export const expenses: Expense[] = Array.from({ length: 25 }, () => {
  const category = faker.helpers.arrayElement(categories);
  return {
    id: faker.string.uuid(),
    title: faker.commerce.productName(),
    category,
    amount: Number(faker.commerce.price({ min: 20, max: 2000 })),
    currency: "BDT",
    referenceId: faker.datatype.boolean({ probability: 0.3 })
      ? faker.string.uuid()
      : undefined,
    notes: faker.datatype.boolean({ probability: 0.2 })
      ? faker.lorem.sentence()
      : undefined,
    createdAt: faker.date.recent({ days: 40 }),
    updatedAt: new Date(),
  };
});
