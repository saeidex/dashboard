import { createId } from "@paralleldrive/cuid2"
import { and, eq } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { SizeUnit } from "@/api/db/schema"
import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { customers, orderItems, orders } from "@/api/db/schema"
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
  const { pageIndex = 0, pageSize = 10 } = c.req.valid("query")

  const data = await db.query.orders.findMany({
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

  const rowCount = await db.$count(orders)

  return c.json({
    rows: data.map(serializeOrderWithDetails),
    pageCount: Math.ceil(rowCount / pageSize),
    rowCount,
  })
}

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const orderId = createId()
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
      .values({ ...payload, id: orderId })
      .returning()

    const insertedOrderItems = items.length
      ? await tx
          .insert(orderItems)
          .values(items.map(item => ({ ...item, orderId })))
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

  return c.json(serializeOrderWithDetails(order), HttpStatusCodes.OK)
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
