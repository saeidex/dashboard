import { and, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { orderItems, orders } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type {
  CreateItemRoute,
  CreateRoute,
  GetOneRoute,
  ListItemsRoute,
  ListRoute,
  PatchItemRoute,
  PatchRoute,
  RemoveItemRoute,
  RemoveRoute,
} from "./orders.routes";

/* --------------------------------- Orders -------------------------------- */

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const data = await db.query.orders.findMany();
  return c.json(data);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const payload = c.req.valid("json");
  // Ensure an id if client didn't pass (uuid-like). Keeping flexible; could enforce regex earlier.
  //   const id = (payload as any).id ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  //   const [inserted] = await db.insert(orders).values({id, ...payload}).returning();
  const [inserted] = await db.insert(orders).values(payload).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const order = await db.query.orders.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id);
    },
  });

  if (!order) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(order, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

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
    );
  }

  const [updated] = await db.update(orders)
    .set(updates)
    .where(eq(orders.id, id))
    .returning();

  if (!updated) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.delete(orders).where(eq(orders.id, id));

  if (result.rowsAffected === 0) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

/* ------------------------------ Order Items ------------------------------ */

export const listItems: AppRouteHandler<ListItemsRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const items = await db.query.orderItems.findMany({
    where(fields, { eq }) {
      return eq(fields.orderId, id);
    },
  });
  return c.json(items, HttpStatusCodes.OK);
};

export const createItem: AppRouteHandler<CreateItemRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");
  //   const itemId = (payload as any).id ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  //   const [inserted] = await db.insert(orderItems)
  //     .values({ id: itemId, ...payload, orderId: id })
  //     .returning();
  const [inserted] = await db.insert(orderItems).values({ ...payload, orderId: id }).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const patchItem: AppRouteHandler<PatchItemRoute> = async (c) => {
  const { id, itemId } = c.req.valid("param");
  const updates = c.req.valid("json");

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
    );
  }

  const [updated] = await db.update(orderItems)
    .set(updates)
    .where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, id)))
    .returning();

  if (!updated) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const removeItem: AppRouteHandler<RemoveItemRoute> = async (c) => {
  const { id, itemId } = c.req.valid("param");
  const result = await db.delete(orderItems)
    .where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, id)));

  if (result.rowsAffected === 0) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
