import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  ProjectedExpense,
  ProjectedOrder,
  ProjectedProduct,
} from "../features/dashboard/data/data";

import {
  computeKpis,
  dashboardExpensesQueryOptions,
  dashboardOrdersQueryOptions,
  dashboardProductsQueryOptions,
  getExpenseCategoryDistribution,
  getLowStock,
  getMonthlyExpensesSeries,
  getMonthlySalesSeries,
  getOrderStatusDistribution,
  getPaymentStatusDistribution,
  getTopProducts,
} from "../features/dashboard/data/data";

// Hook to fetch all dashboard data
export function useDashboardData() {
  const [{ data: productsData }, { data: ordersData }, { data: expensesData }]
    = useQueries({
      queries: [
        dashboardProductsQueryOptions,
        dashboardOrdersQueryOptions,
        dashboardExpensesQueryOptions,
      ],
    });

  const products: ProjectedProduct[] = useMemo(
    () =>
      (productsData ?? []).map(p => ({
        id: p.id,
        name: p.title,
        pricingTotal: p.total,
        stock: p.stock,
        status: p.status === "available" ? "available" : "archived",
        createdAt: new Date(p.createdAt),
      })),
    [productsData],
  );

  const orders: ProjectedOrder[] = useMemo(
    () =>
      (ordersData?.rows ?? []).map(o => ({
        id: o.id,
        createdAt: new Date(o.createdAt),
        status: o.orderStatus,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        totals: {
          itemsTotal: o.retailPrice,
          itemsTaxTotal: o.tax,
          shipping: o.shipping,
          grandTotal: o.grandTotal,
        },
        items: o.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.retailPrice,
          tax: item.product.taxAmount,
        })),
      })),
    [ordersData],
  );

  const expenses: ProjectedExpense[] = useMemo(
    () =>
      (expensesData ?? []).map(e => ({
        id: e.id,
        category: e.category,
        amount: e.amount,
        createdAt: new Date(e.createdAt),
      })),
    [expensesData],
  );

  return {
    products,
    orders,
    expenses,
    isLoading: !productsData || !ordersData || !expensesData,
  };
}

export function useDashboardKpis() {
  const { products, orders, expenses } = useDashboardData();
  return useMemo(
    () => computeKpis(products, orders, expenses),
    [products, orders, expenses],
  );
}

export function useOrderDistributions() {
  const { orders } = useDashboardData();
  return useMemo(
    () => ({
      status: getOrderStatusDistribution(orders),
      payment: getPaymentStatusDistribution(orders),
    }),
    [orders],
  );
}

export function useProductsData() {
  const { products, orders } = useDashboardData();
  return useMemo(
    () => ({
      top: getTopProducts(products, orders),
      lowStock: getLowStock(products),
    }),
    [products, orders],
  );
}

export function useExpenseCategories() {
  const { expenses } = useDashboardData();
  return useMemo(() => getExpenseCategoryDistribution(expenses), [expenses]);
}

export function useExpensesTrend(months = 6) {
  const { expenses } = useDashboardData();
  return useMemo(
    () => getMonthlyExpensesSeries(expenses, months),
    [expenses, months],
  );
}

export function useSalesTrend(months = 12) {
  const { orders } = useDashboardData();
  return useMemo(() => getMonthlySalesSeries(orders, months), [orders, months]);
}
