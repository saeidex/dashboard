import type { OrderStatus, PaymentStatus } from "@takumitex/api/schema";

import { expensesQueryOptions } from "../../accounts/expenses/data/queries";
import { createOrdersQueryOptions } from "../../orders/data/queries";
import { createProductsQueryOptions } from "../../products/data/queries";

export type ProjectedOrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  tax: number;
};

export type ProjectedOrderTotals = {
  itemsTotal: number;
  itemsTaxTotal: number;
  shipping: number;
  grandTotal: number;
};

export type ProjectedOrder = {
  id: number;
  createdAt: Date;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totals: ProjectedOrderTotals;
  items: ProjectedOrderItem[];
};

export type ProjectedProduct = {
  id: string;
  name: string;
  pricingTotal: number;
  stock: number;
  status: "available" | "archived";
  createdAt: Date;
};

export type ProjectedExpense = {
  id: string;
  category: string;
  amount: number;
  createdAt: Date;
};

// Query options for fetching dashboard data
export const dashboardProductsQueryOptions = createProductsQueryOptions({ page: 1, pageSize: 100 });
export const dashboardOrdersQueryOptions = createOrdersQueryOptions({ pageIndex: 0, pageSize: 100 });
export const dashboardExpensesQueryOptions = expensesQueryOptions;

export const sum = (vals: number[]) => vals.reduce((a, b) => a + b, 0);

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function pctChange(current: number, prev: number) {
  if (prev === 0)
    return current === 0 ? 0 : 100;
  return ((current - prev) / prev) * 100;
}

export function computeKpis(
  products: ProjectedProduct[],
  orders: ProjectedOrder[],
  expenses: ProjectedExpense[],
) {
  const orderByMonth: Record<string, { sales: number; orders: number }> = {};
  for (const o of orders) {
    const key = monthKey(o.createdAt);
    if (!orderByMonth[key])
      orderByMonth[key] = { sales: 0, orders: 0 };
    orderByMonth[key].sales += o.totals.grandTotal;
    orderByMonth[key].orders += 1;
  }
  const expenseByMonth: Record<string, number> = {};
  for (const e of expenses) {
    const key = monthKey(e.createdAt);
    expenseByMonth[key] = (expenseByMonth[key] ?? 0) + e.amount;
  }

  const months = Array.from(
    new Set([...Object.keys(orderByMonth), ...Object.keys(expenseByMonth)]),
  ).sort();
  const latest = months[months.length - 1];
  const prev = months[months.length - 2];

  const salesTotal = sum(orders.map(o => o.totals.grandTotal));
  const ordersCount = orders.length;
  const expensesTotal = sum(expenses.map(e => e.amount));
  const inventoryValue = sum(
    products.map(p => p.pricingTotal * p.stock),
  );

  const latestSales = latest ? (orderByMonth[latest]?.sales ?? 0) : 0;
  const prevSales = prev ? (orderByMonth[prev]?.sales ?? 0) : 0;
  const latestOrders = latest ? (orderByMonth[latest]?.orders ?? 0) : 0;
  const prevOrders = prev ? (orderByMonth[prev]?.orders ?? 0) : 0;
  const latestExpenses = latest ? (expenseByMonth[latest] ?? 0) : 0;
  const prevExpenses = prev ? (expenseByMonth[prev] ?? 0) : 0;
  const latestAov = latestOrders ? latestSales / latestOrders : 0;
  const prevAov = prevOrders ? prevSales / prevOrders : 0;

  const trends = {
    salesTotal: pctChange(latestSales, prevSales),
    expensesTotal: pctChange(latestExpenses, prevExpenses),
    ordersCount: pctChange(latestOrders, prevOrders),
    avgOrderValue: pctChange(latestAov, prevAov),
    inventoryValue: 0,
  };

  return {
    salesTotal,
    ordersCount,
    expensesTotal,
    inventoryValue,
    avgOrderValue: ordersCount ? salesTotal / ordersCount : 0,
    trends,
  };
}

export function getMonthlySalesSeries(orders: ProjectedOrder[], limitMonths = 12) {
  const grouped: Record<string, number> = {};
  for (const o of orders) {
    const key = monthKey(o.createdAt);
    grouped[key] = (grouped[key] ?? 0) + o.totals.grandTotal;
  }
  // Determine the range: end at latest order month or current month if empty
  const keys = Object.keys(grouped).sort();
  const endDate = keys.length
    ? new Date(`${keys[keys.length - 1]}-01`)
    : new Date();
  // Build an array of the last `limitMonths` month keys
  const months: string[] = [];
  const cursor = new Date(endDate);
  for (let i = 0; i < limitMonths; i++) {
    const k
      = `${cursor.getFullYear()
      }-${
        String(cursor.getMonth() + 1).padStart(2, "0")}`;
    months.push(k);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  months.reverse();
  return months.map((k) => {
    const date = new Date(`${k}-01`);
    return {
      key: k,
      monthLabel: date.toLocaleString(undefined, { month: "short" }),
      total: grouped[k] ?? 0,
    };
  });
}

export function getMonthlyExpensesSeries(expenses: ProjectedExpense[], limitMonths = 12) {
  const grouped: Record<string, number> = {};
  for (const e of expenses) {
    const key = monthKey(e.createdAt);
    grouped[key] = (grouped[key] ?? 0) + e.amount;
  }
  // Determine the range: end at latest expense month or current month if empty
  const keys = Object.keys(grouped).sort();
  const endDate = keys.length
    ? new Date(`${keys[keys.length - 1]}-01`)
    : new Date();
  // Build an array of the last `limitMonths` month keys
  const months: string[] = [];
  const cursor = new Date(endDate);
  for (let i = 0; i < limitMonths; i++) {
    const k
      = `${cursor.getFullYear()
      }-${
        String(cursor.getMonth() + 1).padStart(2, "0")}`;
    months.push(k);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  months.reverse();
  return months.map((k) => {
    const date = new Date(`${k}-01`);
    return {
      key: k,
      monthLabel: date.toLocaleString(undefined, { month: "short" }),
      total: grouped[k] ?? 0,
    };
  });
}

export function groupCounts<T extends string | number>(
  values: T[],
): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, v) => {
    acc[String(v)] = (acc[String(v)] ?? 0) + 1;
    return acc;
  }, {});
}

export function getOrderStatusDistribution(orders: ProjectedOrder[]) {
  return groupCounts(orders.map(o => o.status));
}

export function getPaymentStatusDistribution(orders: ProjectedOrder[]) {
  return groupCounts(orders.map(o => o.paymentStatus));
}

export function getTopProducts(products: ProjectedProduct[], orders: ProjectedOrder[], limit = 10) {
  const agg: Record<
    string,
    { quantity: number; revenue: number; name: string }
  > = {};
  for (const order of orders) {
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product)
        continue;
      const key = item.productId;
      if (!agg[key])
        agg[key] = { quantity: 0, revenue: 0, name: product.name };
      agg[key].quantity += item.quantity;
      agg[key].revenue
        += item.unitPrice * item.quantity + item.tax;
    }
  }
  return Object.entries(agg)
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getLowStock(products: ProjectedProduct[], threshold = 10) {
  return products
    .filter(p => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 15);
}

export function getExpenseCategoryDistribution(expenses: ProjectedExpense[]) {
  const counts: Record<string, { amount: number; count: number }> = {};
  for (const e of expenses) {
    if (!counts[e.category])
      counts[e.category] = { amount: 0, count: 0 };
    counts[e.category].amount += e.amount;
    counts[e.category].count += 1;
  }
  return Object.entries(counts)
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.amount - a.amount);
}
