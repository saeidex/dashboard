import type { insertUsersSchema, patchUsersSchema } from "@takumitex/api/schema";

import { queryOptions } from "@tanstack/react-query";

import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";

export const queryKeys = {
  LIST_USERS: { queryKey: ["list-users"] },
  LIST_USER: (id: string) => ({ queryKey: ["list-user", id] }),
};

export const usersQueryOptions = queryOptions({
  ...queryKeys.LIST_USERS,
  queryFn: async () => {
    const response = await apiClient.api.users.$get();
    const json = await response.json();

    if ("message" in json) {
      const message = json.message;
      throw new Error(message);
    }
    return json;
  },
});

export async function createUser(payload: insertUsersSchema) {
  const response = await apiClient.api.users.$post({
    json: payload,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
}

export async function updateUser({ id, payload }: { id: string; payload: patchUsersSchema }) {
  const response = await apiClient.api.users[":id"].$patch({
    param: { id },
    json: payload,
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

export async function deleteUser(id: string) {
  const response = await apiClient.api.users[":id"].$delete({
    param: { id },
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
