import { CheckCircle, Circle, CircleOff, Timer } from "lucide-react";

import { productCategories } from "@/web/features/product-categories/data/product-categories";

export const labels = [
  {
    value: "new",
    label: "New",
  },
  {
    value: "popular",
    label: "Popular",
  },
] as const;

export const statuses = [
  {
    label: "Available",
    value: "available" as const,
    icon: CheckCircle,
  },
  {
    label: "Out of Stock",
    value: "out-of-stock" as const,
    icon: CircleOff,
  },
  {
    label: "Coming Soon",
    value: "coming-soon" as const,
    icon: Timer,
  },
  {
    label: "Discontinued",
    value: "discontinued" as const,
    icon: Circle,
  },
] as const;

export const categories = productCategories.map(({ id, name }) => ({
  id,
  name,
}));
