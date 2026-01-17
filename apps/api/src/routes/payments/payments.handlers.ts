import { and, eq, sql, sum } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { customers, orders, payments } from "@/api/db/schema"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  GetOrderPaymentSummaryRoute,
  ListOrderPaymentsRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./payments.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { pageIndex = 0, pageSize = 10, orderId, customerId } = c.req.valid("query")

  const data = await db.query.payments.findMany({
    where: (payments, { eq, and }) => {
      const conditions = []
      if (orderId)
        conditions.push(eq(payments.orderId, orderId))
      if (customerId)
        conditions.push(eq(payments.customerId, customerId))
      return conditions.length ? and(...conditions) : undefined
    },
    limit: pageSize,
    offset: pageIndex * pageSize,
    with: {
      order: {
        columns: {
          id: true,
          orderStatus: true,
          paymentStatus: true,
          grandTotal: true,
        },
      },
      customer: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: (payments, { desc }) => [desc(payments.paidAt)],
  })

  // Calculate totalPaid for each order
  const orderIds = [...new Set(data.map(p => p.orderId))]
  const totalPaidByOrder = new Map<number, number>()

  if (orderIds.length > 0) {
    const totals = await db
      .select({
        orderId: payments.orderId,
        totalPaid: sum(payments.amount).mapWith(Number),
      })
      .from(payments)
      .where(sql`${payments.orderId} IN (${sql.join(orderIds.map(id => sql`${id}`), sql`, `)})`)
      .groupBy(payments.orderId)

    totals.forEach((t) => {
      totalPaidByOrder.set(t.orderId, t.totalPaid ?? 0)
    })
  }

  // Enrich data with totalPaid
  const enrichedData = data.map(payment => ({
    ...payment,
    order: {
      ...payment.order,
      totalPaid: totalPaidByOrder.get(payment.orderId) ?? 0,
    },
  }))

  const rowCount = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(payments)
    .where(and(
      orderId ? eq(payments.orderId, orderId) : undefined,
      customerId ? eq(payments.customerId, customerId) : undefined,
    ))
    .then(res => res[0]?.count ?? 0)

  return c.json({
    rows: enrichedData,
    pageCount: Math.ceil(rowCount / pageSize),
    rowCount,
  })
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json")

  // Verify order exists
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, payload.orderId),
  })

  if (!order) {
    return c.json(
      { message: "Order not found" },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  // Verify customer exists
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, payload.customerId),
  })

  if (!customer) {
    return c.json(
      { message: "Customer not found" },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  // Insert payment and update order payment status in a transaction
  const result = await db.transaction(async (tx) => {
    const [insertedPayment] = await tx
      .insert(payments)
      .values(payload)
      .returning()

    // Calculate total paid for this order
    const totalPaidResult = await tx
      .select({
        totalPaid: sum(payments.amount).mapWith(Number),
      })
      .from(payments)
      .where(eq(payments.orderId, payload.orderId))

    const totalPaid = totalPaidResult[0]?.totalPaid ?? 0

    // Determine payment status
    let paymentStatus: "unpaid" | "partial" | "paid" = "unpaid"
    if (totalPaid >= order.grandTotal) {
      paymentStatus = "paid"
    }
    else if (totalPaid > 0) {
      paymentStatus = "partial"
    }

    // Update order payment status
    await tx
      .update(orders)
      .set({ paymentStatus })
      .where(eq(orders.id, payload.orderId))

    return insertedPayment
  })

  return c.json(result, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")

  const payment = await db.query.payments.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
    with: {
      order: {
        columns: {
          id: true,
          orderStatus: true,
          paymentStatus: true,
          grandTotal: true,
        },
      },
      customer: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })

  if (!payment) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  // Calculate totalPaid for this order
  const totalPaidResult = await db
    .select({
      totalPaid: sum(payments.amount).mapWith(Number),
    })
    .from(payments)
    .where(eq(payments.orderId, payment.orderId))

  const totalPaid = totalPaidResult[0]?.totalPaid ?? 0

  return c.json({
    ...payment,
    order: {
      ...payment.order,
      totalPaid,
    },
  }, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const updates = c.req.valid("json")

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    )
  }

  // Get original payment to know the order
  const originalPayment = await db.query.payments.findFirst({
    where: eq(payments.id, id),
  })

  if (!originalPayment) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning()

    if (!updated) {
      return null
    }

    // Recalculate and update order payment status
    const order = await tx.query.orders.findFirst({
      where: eq(orders.id, originalPayment.orderId),
    })

    if (order) {
      const totalPaidResult = await tx
        .select({
          totalPaid: sum(payments.amount).mapWith(Number),
        })
        .from(payments)
        .where(eq(payments.orderId, originalPayment.orderId))

      const totalPaid = totalPaidResult[0]?.totalPaid ?? 0

      let paymentStatus: "unpaid" | "partial" | "paid" = "unpaid"
      if (totalPaid >= order.grandTotal) {
        paymentStatus = "paid"
      }
      else if (totalPaid > 0) {
        paymentStatus = "partial"
      }

      await tx
        .update(orders)
        .set({ paymentStatus })
        .where(eq(orders.id, originalPayment.orderId))
    }

    return updated
  })

  if (!result) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(result, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")

  // Get original payment to know the order
  const originalPayment = await db.query.payments.findFirst({
    where: eq(payments.id, id),
  })

  if (!originalPayment) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  await db.transaction(async (tx) => {
    await tx.delete(payments).where(eq(payments.id, id))

    // Recalculate and update order payment status
    const order = await tx.query.orders.findFirst({
      where: eq(orders.id, originalPayment.orderId),
    })

    if (order) {
      const totalPaidResult = await tx
        .select({
          totalPaid: sum(payments.amount).mapWith(Number),
        })
        .from(payments)
        .where(eq(payments.orderId, originalPayment.orderId))

      const totalPaid = totalPaidResult[0]?.totalPaid ?? 0

      let paymentStatus: "unpaid" | "partial" | "paid" = "unpaid"
      if (totalPaid >= order.grandTotal) {
        paymentStatus = "paid"
      }
      else if (totalPaid > 0) {
        paymentStatus = "partial"
      }

      await tx
        .update(orders)
        .set({ paymentStatus })
        .where(eq(orders.id, originalPayment.orderId))
    }
  })

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}

export const getOrderPaymentSummary: AppRouteHandler<GetOrderPaymentSummaryRoute> = async (c) => {
  const { orderId } = c.req.valid("param")

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!order) {
    return c.json(
      { message: "Order not found" },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const paymentsData = await db
    .select({
      totalPaid: sum(payments.amount).mapWith(Number),
      paymentCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(payments)
    .where(eq(payments.orderId, orderId))

  const totalPaid = paymentsData[0]?.totalPaid ?? 0
  const paymentCount = paymentsData[0]?.paymentCount ?? 0

  return c.json({
    orderId,
    totalPaid,
    grandTotal: order.grandTotal,
    balance: order.grandTotal - totalPaid,
    paymentCount,
  }, HttpStatusCodes.OK)
}

export const listOrderPayments: AppRouteHandler<ListOrderPaymentsRoute> = async (c) => {
  const { orderId } = c.req.valid("param")

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!order) {
    return c.json(
      { message: "Order not found" },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const data = await db.query.payments.findMany({
    where: eq(payments.orderId, orderId),
    orderBy: (payments, { desc }) => [desc(payments.paidAt)],
  })

  return c.json(data, HttpStatusCodes.OK)
}
