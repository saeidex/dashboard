import type { InferAdminRolesFromOption } from "better-auth/plugins";

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import type { adminOptions } from "@/api/lib/auth";
import type { authClient } from "@/web/features/auth/lib/auth-client";

export type AuthSession = typeof authClient.$Infer["Session"]["session"];
export type AuthUser = typeof authClient.$Infer["Session"]["user"];
export type UserRole = InferAdminRolesFromOption<typeof adminOptions>;

type AuthState = {
  auth: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
};

type AuthActions = {
  auth: {
    setUser: (user: AuthUser | null) => void;
    setSession: (session: AuthSession | null) => void;
    setUserRole: (role: UserRole | string) => void;
    getUserId: () => string | undefined;
    getUserRole: () => UserRole | string | undefined;
    reset: () => void;
  };
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        auth: {
          user: null,
          session: null,
          setUser: user => set(state => ({ auth: { ...state.auth, user } })),
          setSession: session => set(state => ({ auth: { ...state.auth, session } })),
          setUserRole: (role = "user") => set(state => ({
            auth: {
              ...state.auth,
              user: state.auth.user ? { ...state.auth.user, role } : null,
            },
          })),
          getUserId: () => get().auth.user?.id,
          getUserRole: () => get().auth.user?.role ?? undefined,
          reset: () => set(state => ({
            auth: { ...state.auth, user: null, session: null },
          })),
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    { name: "AuthStore" },
  ),
);
