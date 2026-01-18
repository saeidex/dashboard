import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OrdersKanbanLayout = "grid" | "line";

type OrdersUiState = {
  kanbanLayout: OrdersKanbanLayout;
  setKanbanLayout: (layout: OrdersKanbanLayout) => void;
  toggleKanbanLayout: () => void;
};

export const useOrdersUiStore = create<OrdersUiState>()(
  persist(
    set => ({
      kanbanLayout: "line",
      setKanbanLayout: kanbanLayout => set({ kanbanLayout }),
      toggleKanbanLayout: () =>
        set(state => ({
          kanbanLayout: state.kanbanLayout === "grid" ? "line" : "grid",
        })),
    }),
    {
      name: "orders-ui-store",
      partialize: state => ({ kanbanLayout: state.kanbanLayout }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
