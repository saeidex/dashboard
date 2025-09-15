import { expenses } from '@/features/accounts/expenses/data/expenses'
import { orders } from '@/features/orders/data/orders'
import { products } from '@/features/products/data/products'

export type OrderStatus = (typeof orders)[number]['status']
export type PaymentStatus = (typeof orders)[number]['paymentStatus']

interface ProjectedOrderItem {
  productId: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
}

interface ProjectedOrderTotals {
  itemsTotal: number
  discountTotal: number
  itemsTaxTotal: number
  shipping: number
  grandTotal: number
}

interface ProjectedOrder {
  id: string
  createdAt: Date
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  totals: ProjectedOrderTotals
  items: ProjectedOrderItem[]
}

interface ProjectedProduct {
  id: string
  name: string
  pricingTotal: number
  stock: number
  status: 'available' | 'archived'
  createdAt: Date
}

interface ProjectedExpense {
  id: string
  category: string
  amount: number
  createdAt: Date
}

export const projectedProducts: ProjectedProduct[] = products.map((p) => ({
  id: p.id,
  name: p.title,
  pricingTotal: p.pricing.total,
  stock: p.stock,
  status: p.status === 'available' ? 'available' : 'archived',
  createdAt: p.createdAt,
}))

export const projectedOrders: ProjectedOrder[] = orders.map((o) => {
  const items: ProjectedOrderItem[] = o.items.map((it) => ({
    productId: it.productId,
    quantity: it.pricing.quantity,
    unitPrice: it.pricing.unitPrice,
    discount: it.pricing.discountAmount,
    tax: it.pricing.taxAmount,
  }))
  return {
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod ?? 'unknown',
    totals: {
      itemsTotal: o.totals.itemsTotal,
      discountTotal: o.totals.discountTotal,
      itemsTaxTotal: o.totals.itemsTaxTotal,
      shipping: o.totals.shipping,
      grandTotal: o.totals.grandTotal,
    },
    items,
  }
})

export const projectedExpenses: ProjectedExpense[] = expenses.map((e) => ({
  id: e.id,
  category: e.category,
  amount: e.amount,
  createdAt: e.createdAt,
}))

export const sum = (vals: number[]) => vals.reduce((a, b) => a + b, 0)

function monthKey(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

function pctChange(current: number, prev: number) {
  if (prev === 0) return current === 0 ? 0 : 100
  return ((current - prev) / prev) * 100
}

export function computeKpis() {
  const orderByMonth: Record<string, { sales: number; orders: number }> = {}
  for (const o of projectedOrders) {
    const key = monthKey(o.createdAt)
    if (!orderByMonth[key]) orderByMonth[key] = { sales: 0, orders: 0 }
    orderByMonth[key].sales += o.totals.grandTotal
    orderByMonth[key].orders += 1
  }
  const expenseByMonth: Record<string, number> = {}
  for (const e of projectedExpenses) {
    const key = monthKey(e.createdAt)
    expenseByMonth[key] = (expenseByMonth[key] ?? 0) + e.amount
  }

  const months = Array.from(
    new Set([...Object.keys(orderByMonth), ...Object.keys(expenseByMonth)])
  ).sort()
  const latest = months[months.length - 1]
  const prev = months[months.length - 2]

  const salesTotal = sum(projectedOrders.map((o) => o.totals.grandTotal))
  const ordersCount = projectedOrders.length
  const expensesTotal = sum(projectedExpenses.map((e) => e.amount))
  const inventoryValue = sum(
    projectedProducts.map((p) => p.pricingTotal * p.stock)
  )

  const latestSales = latest ? (orderByMonth[latest]?.sales ?? 0) : 0
  const prevSales = prev ? (orderByMonth[prev]?.sales ?? 0) : 0
  const latestOrders = latest ? (orderByMonth[latest]?.orders ?? 0) : 0
  const prevOrders = prev ? (orderByMonth[prev]?.orders ?? 0) : 0
  const latestExpenses = latest ? (expenseByMonth[latest] ?? 0) : 0
  const prevExpenses = prev ? (expenseByMonth[prev] ?? 0) : 0
  const latestAov = latestOrders ? latestSales / latestOrders : 0
  const prevAov = prevOrders ? prevSales / prevOrders : 0

  const trends = {
    salesTotal: pctChange(latestSales, prevSales),
    expensesTotal: pctChange(latestExpenses, prevExpenses),
    ordersCount: pctChange(latestOrders, prevOrders),
    avgOrderValue: pctChange(latestAov, prevAov),
    inventoryValue: 0,
  }

  return {
    salesTotal,
    ordersCount,
    expensesTotal,
    inventoryValue,
    avgOrderValue: ordersCount ? salesTotal / ordersCount : 0,
    trends,
  }
}

export function getMonthlySalesSeries(limitMonths = 12) {
  const grouped: Record<string, number> = {}
  for (const o of projectedOrders) {
    const key = monthKey(o.createdAt)
    grouped[key] = (grouped[key] ?? 0) + o.totals.grandTotal
  }
  const entries = Object.entries(grouped).sort((a, b) =>
    a[0].localeCompare(b[0])
  )
  const sliced = entries.slice(-limitMonths)
  return sliced.map(([k, total]) => {
    const date = new Date(k + '-01')
    return {
      key: k,
      monthLabel: date.toLocaleString(undefined, { month: 'short' }),
      total,
    }
  })
}

export function getMonthlyExpensesSeries(limitMonths = 12) {
  const grouped: Record<string, number> = {}
  for (const e of projectedExpenses) {
    const key = monthKey(e.createdAt)
    grouped[key] = (grouped[key] ?? 0) + e.amount
  }
  // Determine the range: end at latest expense month or current month if empty
  const keys = Object.keys(grouped).sort()
  const endDate = keys.length
    ? new Date(keys[keys.length - 1] + '-01')
    : new Date()
  // Build an array of the last `limitMonths` month keys
  const months: string[] = []
  const cursor = new Date(endDate)
  for (let i = 0; i < limitMonths; i++) {
    const k =
      cursor.getFullYear() +
      '-' +
      String(cursor.getMonth() + 1).padStart(2, '0')
    months.push(k)
    cursor.setMonth(cursor.getMonth() - 1)
  }
  months.reverse()
  return months.map((k) => {
    const date = new Date(k + '-01')
    return {
      key: k,
      monthLabel: date.toLocaleString(undefined, { month: 'short' }),
      total: grouped[k] ?? 0,
    }
  })
}

export function groupCounts<T extends string | number>(
  values: T[]
): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, v) => {
    acc[String(v)] = (acc[String(v)] ?? 0) + 1
    return acc
  }, {})
}

export function getOrderStatusDistribution() {
  return groupCounts(projectedOrders.map((o) => o.status))
}

export function getPaymentStatusDistribution() {
  return groupCounts(projectedOrders.map((o) => o.paymentStatus))
}

export function getTopProducts(limit = 10) {
  const agg: Record<
    string,
    { quantity: number; revenue: number; name: string }
  > = {}
  for (const order of projectedOrders) {
    for (const item of order.items) {
      const product = projectedProducts.find((p) => p.id === item.productId)
      if (!product) continue
      const key = item.productId
      if (!agg[key]) agg[key] = { quantity: 0, revenue: 0, name: product.name }
      agg[key].quantity += item.quantity
      agg[key].revenue +=
        item.unitPrice * item.quantity - item.discount + item.tax
    }
  }
  return Object.entries(agg)
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function getLowStock(threshold = 10) {
  return projectedProducts
    .filter((p) => p.stock <= threshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 15)
}

export function getExpenseCategoryDistribution() {
  const counts: Record<string, { amount: number; count: number }> = {}
  for (const e of projectedExpenses) {
    if (!counts[e.category]) counts[e.category] = { amount: 0, count: 0 }
    counts[e.category].amount += e.amount
    counts[e.category].count += 1
  }
  return Object.entries(counts)
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.amount - a.amount)
}
