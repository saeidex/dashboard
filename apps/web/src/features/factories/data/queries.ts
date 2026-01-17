import type { insertFactoriesSchema, patchFactoriesSchema } from "@takumitex/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_FACTORIES: { queryKey: ["list-factories"] },
  LIST_FACTORY: (id: string) => ({ queryKey: [`list-factory-${id}`] }),
};

export const factoriesQueryOptions = queryOptions({
  ...queryKeys.LIST_FACTORIES,
  queryFn: async () => {
    const response = await apiClient.api.factories.$get();
    return response.json();
  },
});

export function createFactoryQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_FACTORY(id),
    queryFn: async () => {
      const response = await apiClient.api.factories[":id"].$get({
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

export async function createFactory(factory: insertFactoriesSchema) {
  const response = await apiClient.api.factories.$post({
    json: factory,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteFactory(id: string) {
  const response = await apiClient.api.factories[":id"].$delete({
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

export async function updateFactory({ id, factory }: { id: string; factory: patchFactoriesSchema }) {
  const response = await apiClient.api.factories[":id"].$patch({
    param: {
      id,
    },
    json: factory,
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
