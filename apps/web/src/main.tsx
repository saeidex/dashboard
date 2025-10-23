import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { toast } from "sonner";

import { DirectionProvider } from "./context/direction-provider";
import { FontProvider } from "./context/font-provider";
import { ThemeProvider } from "./context/theme-provider";
import { handleServerError } from "./lib/handle-server-error";
// Generated Routes
import { routeTree } from "./routeTree.gen";
// Styles
import "./styles/index.css";
import { useAuthStore } from "./stores/auth-store";

const getErrorStatus = (error: unknown): number | undefined => {
  if (error instanceof Response) {
    return error.status;
  }

  if (
    typeof error === "object"
    && error !== null
    && "status" in error
    && typeof (error as { status?: number }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  if (
    typeof error === "object"
    && error !== null
    && "response" in error
    && typeof (error as { response?: { status?: number } }).response?.status === "number"
  ) {
    return (error as { response: { status: number } }).response.status;
  }

  return undefined;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV)
        // eslint-disable-next-line no-console
          console.log({ failureCount, error });

        if (failureCount >= 0 && import.meta.env.DEV)
          return false;
        if (failureCount > 3 && import.meta.env.PROD)
          return false;

        const status = getErrorStatus(error);
        return !(status && [401, 403].includes(status));
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);

        const status = getErrorStatus(error);
        if (status === 304) {
          toast.error("Content not modified!");
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      const status = getErrorStatus(error);

      if (status === 401) {
        toast.error("Session expired!");
        useAuthStore.getState().reset();
        // eslint-disable-next-line ts/no-use-before-define
        const redirect = `${router.history.location.href}`;
        // eslint-disable-next-line ts/no-use-before-define
        router.navigate({ to: "/sign-in", search: { redirect } });
      }
      if (status === 500) {
        toast.error("Internal Server Error!");
        // eslint-disable-next-line ts/no-use-before-define
        router.navigate({ to: "/500" });
      }
      if (status === 403) {
        // router.navigate("/forbidden", { replace: true });
      }
    },
  }),
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
