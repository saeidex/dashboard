import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fonts } from "@/web/config/fonts";
import { getCookie, removeCookie, setCookie } from "@/web/lib/cookies";

type Font = (typeof fonts)[number];

const FONT_COOKIE_NAME = "font";
const FONT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type FontContextType = {
  font: Font;
  setFont: (font: Font) => void;
  resetFont: () => void;
};

const FontContext = createContext<FontContextType | null>(null);

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, _setFont] = useState<Font>(() => {
    const savedFont = getCookie(FONT_COOKIE_NAME);
    return fonts.includes(savedFont as Font) ? (savedFont as Font) : fonts[0];
  });

  useEffect(() => {
    const applyFont = (font: string) => {
      const root = document.documentElement;
      root.classList.forEach((cls) => {
        if (cls.startsWith("font-"))
          root.classList.remove(cls);
      });
      root.classList.add(`font-${font}`);
    };

    applyFont(font);
  }, [font]);

  const setFont = useCallback(
    (font: Font) => {
      setCookie(FONT_COOKIE_NAME, font, FONT_COOKIE_MAX_AGE);
      _setFont(font);
    },
    [_setFont],
  );

  const resetFont = useCallback(() => {
    removeCookie(FONT_COOKIE_NAME);
    _setFont(fonts[0]);
  }, [_setFont]);

  const value = useMemo(
    () => ({ font, setFont, resetFont }),
    [font, setFont, resetFont],
  );

  return <FontContext value={value}>{children}</FontContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFont = () => {
  const context = use(FontContext);
  if (!context) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
};
