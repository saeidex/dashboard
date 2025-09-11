import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { extractSidebarItems } from '@/lib/sidebar-utils'
import { sidebarData } from '@/components/layout/data/sidebar-data'

interface DisplaySettings {
  sidebarItems: string[]
}

interface SettingsState {
  display: DisplaySettings
  setDisplaySettings: (settings: Partial<DisplaySettings>) => void
  setSidebarItems: (items: string[]) => void
}

const availableItems = extractSidebarItems(sidebarData)
const defaultDisplaySettings: DisplaySettings = {
  sidebarItems: availableItems.map((item) => item.id),
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      display: defaultDisplaySettings,
      setDisplaySettings: (settings) =>
        set((state) => ({
          display: { ...state.display, ...settings },
        })),
      setSidebarItems: (items) =>
        set((state) => ({
          display: { ...state.display, sidebarItems: items },
        })),
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({ display: state.display }),
    }
  )
)
