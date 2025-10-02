import { DirectionProvider as RdxDirProvider } from "@radix-ui/react-direction";
import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";

import { getCookie, removeCookie, setCookie } from "@/web/lib/cookies";

export type Direction = "ltr" | "rtl";

const DEFAULT_DIRECTION: Direction = "ltr";
const DIRECTION_COOKIE_NAME = "dir";
const DIRECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type DirectionContextType = {
  defaultDir: Direction;
  dir: Direction;
  setDir: (dir: Direction) => void;
  resetDir: () => void;
};

const DirectionContext = createContext<DirectionContextType | null>(null);

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [dir, _setDir] = useState<Direction>(
    () => (getCookie(DIRECTION_COOKIE_NAME) as Direction) || DEFAULT_DIRECTION,
  );

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("dir", dir);
  }, [dir]);

  const setDir = useCallback((newDir: Direction) => {
    _setDir(newDir);
    setCookie(DIRECTION_COOKIE_NAME, newDir, DIRECTION_COOKIE_MAX_AGE);
  }, []);

  const resetDir = useCallback(() => {
    _setDir(DEFAULT_DIRECTION);
    removeCookie(DIRECTION_COOKIE_NAME);
  }, []);

  const contextValue = useMemo(
    () => ({
      defaultDir: DEFAULT_DIRECTION,
      dir,
      setDir,
      resetDir,
    }),
    [dir, setDir, resetDir],
  );

  return (
    <DirectionContext value={contextValue}>
      <RdxDirProvider dir={dir}>{children}</RdxDirProvider>
    </DirectionContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection() {
  const context = use(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used within a DirectionProvider");
  }
  return context;
}
