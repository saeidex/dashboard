import { and, eq, isNull, sql, sum } from "drizzle-orm"
import * as HttpStatusCodes from "stoker/http-status-codes"
import * as HttpStatusPhrases from "stoker/http-status-phrases"

import type { SizeUnit } from "@/api/db/schema"
import type { AppRouteHandler } from "@/api/lib/types"

import db from "@/api/db"
import { customers, orderItems, orders, payments } from "@/api/db/schema"
import { createAuditLog, formatCurrency } from "@/api/lib/audit"
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
    factory: order.factory ?? null,
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
    where: (orders, { eq, and, isNull }) => {
      const conditions = [isNull(orders.deletedAt)]
      if (customerId)
        conditions.push(eq(orders.customerId, customerId))
      return and(...conditions)
    },
    limit: pageSize,
    offset: pageIndex * pageSize,
    with: {
      customer: true,
      factory: true,
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

  // Calculate totalPaid for each order (excluding soft-deleted payments)
  const orderIds = data.map(o => o.id)
  const totalPaidByOrder = new Map<number, number>()

  if (orderIds.length > 0) {
    const totals = await db
      .select({
        orderId: payments.orderId,
        totalPaid: sum(payments.amount).mapWith(Number),
      })
      .from(payments)
      .where(and(
        sql`${payments.orderId} IN (${sql.join(orderIds.map(id => sql`${id}`), sql`, `)})`,
        isNull(payments.deletedAt),
      ))
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
      isNull(orders.deletedAt),
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

  // Create audit log for order creation
  await createAuditLog({
    actionType: "order_created",
    entityType: "order",
    entityId: String(insertedOrder.id),
    orderId: insertedOrder.id,
    customerId: customer.id,
    description: `New order #${insertedOrder.id} created for ${customer.name} - Total: ${formatCurrency(insertedOrder.grandTotal, insertedOrder.currency)}`,
    metadata: {
      grandTotal: insertedOrder.grandTotal,
      itemCount: items.length,
      currency: insertedOrder.currency,
    },
  })

  return c.json({ ...insertedOrder, customer }, HttpStatusCodes.OK)
}

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param")

  const order = await db.query.orders.findFirst({
    where: (fields, { eq, and, isNull }) => and(eq(fields.id, id), isNull(fields.deletedAt)),
    with: {
      customer: true,
      factory: true,
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

  // Calculate totalPaid for this order (excluding soft-deleted payments)
  const totalPaidResult = await db
    .select({
      totalPaid: sum(payments.amount).mapWith(Number),
    })
    .from(payments)
    .where(and(eq(payments.orderId, order.id), isNull(payments.deletedAt)))

  const totalPaid = totalPaidResult[0]?.totalPaid ?? 0

  return c.json({
    ...serializeOrderWithDetails(order),
    totalPaid,
  }, HttpStatusCodes.OK)
}

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param")
  const { items, ...updates } = c.req.valid("json")

  const existingOrder = await db.query.orders.findFirst({
    where: (fields, { eq, and, isNull }) => and(eq(fields.id, id), isNull(fields.deletedAt)),
  })

  if (!existingOrder) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

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

  // Create audit logs based on specific changes

  // 1. Order Status Change
  if (updates.orderStatus && updates.orderStatus !== existingOrder.orderStatus) {
    await createAuditLog({
      actionType: "order_status_changed",
      entityType: "order",
      entityId: String(id),
      orderId: id,
      customerId: updatedOrder.customerId,
      description: `Order #${id} status changed from "${existingOrder.orderStatus}" to "${updates.orderStatus}"`,
      metadata: {
        previousStatus: existingOrder.orderStatus,
        newStatus: updates.orderStatus,
      },
    })
  }

  // 2. Production Stage Change
  if (updates.productionStage && updates.productionStage !== existingOrder.productionStage) {
    await createAuditLog({
      actionType: "order_updated",
      entityType: "order",
      entityId: String(id),
      orderId: id,
      customerId: updatedOrder.customerId,
      description: `Order #${id} production stage updated to "${updates.productionStage}"`,
      metadata: {
        previousStage: existingOrder.productionStage,
        newStage: updates.productionStage,
      },
    })
  }

  // 3. Payment Status Change
  if (updates.paymentStatus && updates.paymentStatus !== existingOrder.paymentStatus) {
    await createAuditLog({
      actionType: "order_updated",
      entityType: "order",
      entityId: String(id),
      orderId: id,
      customerId: updatedOrder.customerId,
      description: `Order #${id} payment status changed to "${updates.paymentStatus}"`,
      metadata: {
        previousPaymentStatus: existingOrder.paymentStatus,
        newPaymentStatus: updates.paymentStatus,
      },
    })
  }

  // 4. Other Field Updates
  const specialFields = ["orderStatus", "productionStage", "paymentStatus"]
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  const otherUpdatedFields = Object.keys(updates).filter(key => !specialFields.includes(key) && updates[key] !== existingOrder[key])

  if (otherUpdatedFields.length > 0) {
    await createAuditLog({
      actionType: "order_updated",
      entityType: "order",
      entityId: String(id),
      orderId: id,
      customerId: updatedOrder.customerId,
      description: `Order #${id} updated`,
      metadata: { updatedFields: otherUpdatedFields },
    })
  }

  // 5. Item Updates
  if (hasItemUpdates) {
    await createAuditLog({
      actionType: "order_updated",
      entityType: "order",
      entityId: String(id),
      orderId: id,
      customerId: updatedOrder.customerId,
      description: `Order #${id} items updated`,
      metadata: { itemCount: items.length },
    })
  }

  return c.json(updatedOrder, HttpStatusCodes.OK)
}

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param")
  // Soft delete: set deletedAt timestamp instead of actually deleting
  const result = await db
    .update(orders)
    .set({ deletedAt: new Date() })
    .where(and(eq(orders.id, id), isNull(orders.deletedAt)))

  if (result.rowsAffected === 0) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    )
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT)
}
