import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCookie, removeCookie, setCookie } from "@/web/lib/cookies";

export type ColorTheme
  = | "catppuccin"
    | "bubblegum"
    | "caffeine"
    | "cosmic-night"
    | "violet-bloom"
    | "elegant-luxury"
    | "mono"
    | "cyberpunk"
    | "pastel-dreams";

const DEFAULT_COLOR_THEME: ColorTheme = "catppuccin";
const COLOR_THEME_COOKIE_NAME = "vite-ui-color-theme";
const COLOR_THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type ColorThemeProviderProps = {
  children: React.ReactNode;
  defaultColorTheme?: ColorTheme;
  storageKey?: string;
};

type ColorThemeProviderState = {
  defaultColorTheme: ColorTheme;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  resetColorTheme: () => void;
};

const initialState: ColorThemeProviderState = {
  defaultColorTheme: DEFAULT_COLOR_THEME,
  colorTheme: DEFAULT_COLOR_THEME,
  setColorTheme: () => null,
  resetColorTheme: () => null,
};

const ColorThemeContext = createContext<ColorThemeProviderState>(initialState);

export function ColorThemeProvider({
  children,
  defaultColorTheme = DEFAULT_COLOR_THEME,
  storageKey = COLOR_THEME_COOKIE_NAME,
  ...props
}: ColorThemeProviderProps) {
  const [colorTheme, _setColorTheme] = useState<ColorTheme>(
    () => (getCookie(storageKey) as ColorTheme) || defaultColorTheme,
  );

  // Apply theme class to document root
  useEffect(() => {
    const root = window.document.documentElement;
    const allColorThemes: ColorTheme[] = [
      "catppuccin",
      "bubblegum",
      "caffeine",
      "cosmic-night",
      "violet-bloom",
      "elegant-luxury",
      "mono",
      "cyberpunk",
      "pastel-dreams",
    ];

    // Remove all existing color theme classes
    allColorThemes.forEach((theme) => {
      root.classList.remove(`theme-${theme}`);
    });

    // Add the new color theme class
    root.classList.add(`theme-${colorTheme}`);
  }, [colorTheme]);

  const setColorTheme = useCallback(
    (colorTheme: ColorTheme) => {
      setCookie(storageKey, colorTheme, COLOR_THEME_COOKIE_MAX_AGE);
      _setColorTheme(colorTheme);
    },
    [storageKey],
  );

  const resetColorTheme = useCallback(() => {
    removeCookie(storageKey);
    _setColorTheme(DEFAULT_COLOR_THEME);
  }, [storageKey]);

  const contextValue = useMemo(
    () => ({
      defaultColorTheme,
      colorTheme,
      setColorTheme,
      resetColorTheme,
    }),
    [defaultColorTheme, colorTheme, setColorTheme, resetColorTheme],
  );

  return (
    <ColorThemeContext value={contextValue} {...props}>
      {children}
    </ColorThemeContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useColorTheme = () => {
  const context = use(ColorThemeContext);

  if (!context)
    throw new Error("useColorTheme must be used within a ColorThemeProvider");

  return context;
};
