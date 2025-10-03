import { accessController, admin, user } from "@crm/api/lib/permissions";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac: accessController,
      roles: { admin, user },
    }),
  ],
});
