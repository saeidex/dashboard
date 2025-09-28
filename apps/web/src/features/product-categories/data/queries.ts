import type { insertProductCategoriesSchema, patchProductCategoriesSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_CATEGORIES: { queryKey: ["list-categories"] },
  LIST_CATEGORY: (id: number) => ({ queryKey: [`list-category-${id}`] }),
};

export const categoriesQueryOptions = queryOptions({
  ...queryKeys.LIST_CATEGORIES,
  queryFn: async () => {
    const response = await apiClient.api.categories.$get();
    return response.json();
  },
});

export function createCategoryQueryOptions(id: number) {
  return queryOptions({
    ...queryKeys.LIST_CATEGORY(id),
    queryFn: async () => {
      const response = await apiClient.api.categories[":id"].$get({
        param: {
          id,
        },
      });
      const json = await response.json();
      if ("message" in json) {
        throw new Error(json.message);
      }
      if ("success" in json) {
        const message = formatApiError(json);
        throw new Error(message);
      }
      return json;
    },
  });
}

export async function createCategory(category: insertProductCategoriesSchema) {
  const response = await apiClient.api.categories.$post({
    json: category,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteCategory(id: number) {
  const response = await apiClient.api.categories[":id"].$delete({
    param: {
      id,
    },
  });
  if (response.status !== 204) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
}

export async function updateCategory({ id, category }: { id: number; category: patchProductCategoriesSchema }) {
  const response = await apiClient.api.categories[":id"].$patch({
    param: {
      id,
    },
    json: category,
  });
  if (response.status !== 200) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
}
