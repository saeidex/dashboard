import { create } from "zustand";
import { persist } from "zustand/middleware";

import { sidebarData } from "@/web/components/layout/data/sidebar-data";
import { extractSidebarItems } from "@/web/lib/sidebar-utils";

type DisplaySettings = {
  sidebarItems: string[];
};

type SettingsState = {
  display: DisplaySettings;
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void;
  setSidebarItems: (items: string[]) => void;
};

const availableItems = extractSidebarItems(sidebarData);
const defaultDisplaySettings: DisplaySettings = {
  sidebarItems: availableItems.map(item => item.id),
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      display: defaultDisplaySettings,
      setDisplaySettings: settings =>
        set(state => ({
          display: { ...state.display, ...settings },
        })),
      setSidebarItems: items =>
        set(state => ({
          display: { ...state.display, sidebarItems: items },
        })),
    }),
    {
      name: "settings-store",
      partialize: state => ({ display: state.display }),
    },
  ),
);
