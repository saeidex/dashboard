import type { insertVendorsSchema, patchVendorsSchema } from "@crm/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_VENDORS: { queryKey: ["list-vendors"] },
  LIST_VENDOR: (id: string) => ({ queryKey: [`list-vendor-${id}`] }),
};

export const vendorsQueryOptions = queryOptions({
  ...queryKeys.LIST_VENDORS,
  queryFn: async () => {
    const response = await apiClient.api.vendors.$get();
    return response.json();
  },
});

export function createVendorQueryOptions(id: string) {
  return queryOptions({
    ...queryKeys.LIST_VENDOR(id),
    queryFn: async () => {
      const response = await apiClient.api.vendors[":id"].$get({
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

export async function createVendor(vendor: insertVendorsSchema) {
  const response = await apiClient.api.vendors.$post({
    json: vendor,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function deleteVendor(id: string) {
  const response = await apiClient.api.vendors[":id"].$delete({
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

export async function updateVendor({ id, vendor }: { id: string; vendor: patchVendorsSchema }) {
  const response = await apiClient.api.vendors[":id"].$patch({
    param: {
      id,
    },
    json: vendor,
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
