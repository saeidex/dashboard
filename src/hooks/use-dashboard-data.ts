import { useMemo } from 'react'
import {
  computeKpis,
  getExpenseCategoryDistribution,
  getLowStock,
  getMonthlyExpensesSeries,
  getOrderStatusDistribution,
  getPaymentStatusDistribution,
  getTopProducts,
} from '../features/dashboard/data/data'

export function useDashboardKpis() {
  return useMemo(() => computeKpis(), [])
}

export function useOrderDistributions() {
  return useMemo(
    () => ({
      status: getOrderStatusDistribution(),
      payment: getPaymentStatusDistribution(),
    }),
    []
  )
}

export function useProductsData() {
  return useMemo(
    () => ({
      top: getTopProducts(),
      lowStock: getLowStock(),
    }),
    []
  )
}

export function useExpenseCategories() {
  return useMemo(() => getExpenseCategoryDistribution(), [])
}

export function useExpensesTrend(months = 6) {
  return useMemo(() => getMonthlyExpensesSeries(months), [months])
}
