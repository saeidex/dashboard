import { create } from "zustand";

import { getCookie, removeCookie, setCookie } from "@/web/lib/cookies";

const ACCESS_TOKEN = "thisisjustarandomstring";

type AuthUser = {
  accountNo: string;
  email: string;
  role: string[];
  exp: number;
};

type AuthState = {
  auth: {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    resetAccessToken: () => void;
    reset: () => void;
  };
};

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN);
  const initToken = cookieState ? JSON.parse(cookieState) : "";
  return {
    auth: {
      user: null,
      setUser: user =>
        set(state => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: accessToken =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken));
          return { ...state, auth: { ...state.auth, accessToken } };
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN);
          return { ...state, auth: { ...state.auth, accessToken: "" } };
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN);
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: "" },
          };
        }),
    },
  };
});
