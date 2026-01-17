/**
 * Customer Ranking System
 *
 * Ranks customers based on their order count into tiers:
 * - Platinum: Top 5% of customers
 * - Gold: Top 15% of customers
 * - Silver: Top 35% of customers
 * - Bronze: Rest of customers with at least 1 order
 * - New: Customers with no orders
 */

export type CustomerTier = "platinum" | "gold" | "silver" | "bronze" | "new";

export type CustomerRanking = {
  tier: CustomerTier;
  label: string;
  color: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
};

const TIER_CONFIG: Record<CustomerTier, Omit<CustomerRanking, "tier">> = {
  platinum: {
    label: "Platinum",
    color: "#a855f7",
    textClass: "text-purple-500 dark:text-purple-400",
    bgClass: "bg-purple-100 dark:bg-purple-900/30",
    borderClass: "border-purple-300 dark:border-purple-700",
  },
  gold: {
    label: "Gold",
    color: "#eab308",
    textClass: "text-yellow-600 dark:text-yellow-400",
    bgClass: "bg-yellow-100 dark:bg-yellow-900/30",
    borderClass: "border-yellow-300 dark:border-yellow-700",
  },
  silver: {
    label: "Silver",
    color: "#6b7280",
    textClass: "text-gray-500 dark:text-gray-400",
    bgClass: "bg-gray-100 dark:bg-gray-800/50",
    borderClass: "border-gray-300 dark:border-gray-600",
  },
  bronze: {
    label: "Bronze",
    color: "#d97706",
    textClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-100 dark:bg-orange-900/30",
    borderClass: "border-orange-300 dark:border-orange-700",
  },
  new: {
    label: "New",
    color: "#3b82f6",
    textClass: "text-blue-500 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/30",
    borderClass: "border-blue-300 dark:border-blue-700",
  },
};

/**
 * Calculate tier thresholds based on order count distribution
 */
export function calculateTierThresholds(orderCounts: number[]): {
  platinum: number;
  gold: number;
  silver: number;
} {
  const validCounts = orderCounts.filter(c => c > 0).sort((a, b) => b - a);

  if (validCounts.length === 0) {
    return { platinum: 10, gold: 5, silver: 2 };
  }

  const platinumIndex = Math.floor(validCounts.length * 0.05);
  const goldIndex = Math.floor(validCounts.length * 0.15);
  const silverIndex = Math.floor(validCounts.length * 0.35);

  return {
    platinum: validCounts[platinumIndex] ?? validCounts[0] ?? 10,
    gold: validCounts[goldIndex] ?? validCounts[0] ?? 5,
    silver: validCounts[silverIndex] ?? 1,
  };
}

/**
 * Get the tier for a customer based on their order count
 */
export function getCustomerTier(
  orderCount: number,
  thresholds: { platinum: number; gold: number; silver: number },
): CustomerTier {
  if (orderCount === 0)
    return "new";
  if (orderCount >= thresholds.platinum)
    return "platinum";
  if (orderCount >= thresholds.gold)
    return "gold";
  if (orderCount >= thresholds.silver)
    return "silver";
  return "bronze";
}

/**
 * Get the full ranking info for a customer
 */
export function getCustomerRanking(
  orderCount: number,
  thresholds: { platinum: number; gold: number; silver: number },
): CustomerRanking {
  const tier = getCustomerTier(orderCount, thresholds);
  return {
    tier,
    ...TIER_CONFIG[tier],
  };
}

/**
 * Get ranking info directly by tier
 */
export function getRankingByTier(tier: CustomerTier): CustomerRanking {
  return {
    tier,
    ...TIER_CONFIG[tier],
  };
}
