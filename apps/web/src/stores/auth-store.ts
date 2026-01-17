import type { InferAdminRolesFromOption } from "better-auth/plugins";

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import type { adminOptions } from "@/api/lib/auth";
import type { authClient } from "@/web/features/auth/lib/auth-client";

export type AuthSession = (typeof authClient.$Infer)["Session"]["session"];
export type AuthUser = (typeof authClient.$Infer)["Session"]["user"];
export type UserRole = InferAdminRolesFromOption<typeof adminOptions>;

type AuthState = {
  user: AuthUser | null;
  session: AuthSession | null;
};

type AuthActions = {
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setUserRole: (role: UserRole | string) => void;
  getUserId: () => string | undefined;
  getUserRole: () => UserRole | string | undefined;
  reset: () => void;
};

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        session: null,
        setUser: user => set({ user }),
        setSession: session => set({ session }),
        setUserRole: (role = "user") =>
          set(state => ({
            user: state.user ? { ...state.user, role } : null,
          })),
        getUserId: () => get().user?.id,
        getUserRole: () => get().user?.role ?? undefined,
        reset: () => set({ user: null, session: null }),
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => sessionStorage),
        partialize: state => ({
          user: state.user,
          session: state.session,
        }),
      },
    ),
    { name: "AuthStore" },
  ),
);
