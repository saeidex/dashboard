import { and, eq, sql, sum } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { SizeUnit } from "@/api/db/schema"
import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { customers, orderItems, orders, payments } from "@/api/db/schema"
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants"

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./orders.routes"

function serializeSize(size: any): {
  id: number
  name: string
  length: number
  width: number
  height: number
  unit: SizeUnit
  description: string | null
  createdAt: string
  updatedAt: string
} | null {
  if (!size)
    return null
  return {
    ...size,
    unit: size.unit as SizeUnit,
  }
}

function serializeOrderWithDetails(order: any) {
  return {
    ...order,
    items: order.items.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        size: serializeSize(item.product.size),
      },
    })),
  }
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const { pageIndex = 0, pageSize = 10, customerId } = c.req.valid("query")

  const data = await db.query.orders.findMany({
    where: (orders, { eq, and }) => {
      return customerId ? and(eq(orders.customerId, customerId)) : undefined
    },
    limit: pageSize,
    offset: pageIndex * pageSize,
    with: {
      customer: true,
      items: {
        with: {
          product: {
            with: {
              size: true,
            },
          },
        },
      },
    },
  })

  // Calculate totalPaid for each order
  const orderIds = data.map(o => o.id)
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

  const rowCount = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(orders)
    .where(and(
      customerId ? eq(orders.customerId, customerId) : undefined,
    ))
    .then(res => res[0]?.count ?? 0)

  return c.json({
    rows: data.map(order => ({
      ...serializeOrderWithDetails(order),
      totalPaid: totalPaidByOrder.get(order.id) ?? 0,
    })),
    pageCount: Math.ceil(rowCount / pageSize),
    rowCount,
  })
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const { items, ...payload } = c.req.valid("json")

  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, payload.customerId)),
  })

  if (!customer) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const insertedOrder = await db.transaction(async (tx) => {
    const [insertedOrderBase] = await tx
      .insert(orders)
      .values(payload)
      .returning()

    const insertedOrderItems = items.length
      ? await tx
          .insert(orderItems)
          .values(items.map(item => ({ ...item, orderId: insertedOrderBase.id })))
          .returning()
      : []

    return { ...insertedOrderBase, items: insertedOrderItems }
  })

  return c.json({ ...insertedOrder, customer }, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")

  const order = await db.query.orders.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
    with: {
      customer: true,
      items: {
        with: {
          product: {
            with: {
              size: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
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
    .where(eq(payments.orderId, order.id))

  const totalPaid = totalPaidResult[0]?.totalPaid ?? 0

  return c.json({
    ...serializeOrderWithDetails(order),
    totalPaid,
  }, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const { items, ...updates } = c.req.valid("json")

  const hasOrderUpdates = Object.keys(updates).length > 0
  const hasItemUpdates = typeof items !== "undefined" && items.length > 0

  if (!hasOrderUpdates && !hasItemUpdates) {
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

  const updatedOrder = await db.transaction(async (tx) => {
    if (hasOrderUpdates) {
      await tx.update(orders).set(updates).where(eq(orders.id, id)).returning()
    }

    if (hasItemUpdates) {
      for (const { id: itemId, ...item } of items) {
        await tx.update(orderItems).set(item).where(and(eq(orderItems.orderId, id))).returning()
      }
    }

    return await tx.query.orders.findFirst({
      where: (fields, { eq }) => eq(fields.id, id),
      with: {
        items: true,
        customer: true,
      },
    })
  })

  if (!updatedOrder) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.json(updatedOrder, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const result = await db.delete(orders).where(eq(orders.id, id))

  if (result.rowsAffected === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
