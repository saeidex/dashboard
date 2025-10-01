import type { selectOrdersSchema, selectOrderWithItemsAndCustomerSchema, selectOrderWithItemsSchema } from "@crm/api/schema";

export type OrderWithItemsAndCustomer = selectOrderWithItemsAndCustomerSchema;
export type OrderWithItems = selectOrderWithItemsSchema;
export type Order = selectOrdersSchema;
