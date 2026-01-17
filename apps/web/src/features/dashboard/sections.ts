export type DashboardSection = {
  id: string;
  label: string;
  disabled: boolean;
};

export const dashboardSections: DashboardSection[] = [
  {
    id: "overview",
    label: "Overview",
    disabled: false,
  },
  {
    id: "orders",
    label: "Orders Pipeline",
    disabled: false,
  },
  {
    id: "products",
    label: "Products & Inventory",
    disabled: false,
  },
  {
    id: "expenses",
    label: "Expenses",
    disabled: false,
  },
  {
    id: "activity",
    label: "Activity History",
    disabled: false,
  },
];
