import type { insertProductCategoriesSchema } from "@crm/api/schema";

export type Category = insertProductCategoriesSchema & {
  id: number;
};
