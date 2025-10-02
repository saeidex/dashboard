import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";

import type { Order } from "../data/schema";

import { OwnerInfo } from "../data/data";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "BDT" ? "BDT" : "USD",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace(/BDT/, "৳");
}

export const Invoice = ({
  order,
  printRef,
}: {
  order: Order;
  printRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const customer = order.customer;
  const orderItems = order.items;

  const headerConfig = [
    { label: "#", className: "w-8 text-muted-foreground" },
    { label: "Item", className: "" },
    { label: "Qty", className: "text-right w-12" },
    { label: "Unit", className: "text-right w-20" },
    { label: "Discount", className: "text-right w-24" },
    { label: "Tax", className: "text-right w-20" },
    { label: "Total", className: "text-right w-24" },
  ] as const;

  return (
    <div className="print:pt-0">
      <div
        ref={printRef}
        className="bg-background relative mx-auto w-full max-w-4xl rounded-lg border p-6 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none"
      >
        <section className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between print:flex-row print:items-start print:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
            <h2 className="text-muted-foreground text-2xl font-light">
              Order
              {" "}
              <span className="font-medium">{order.id}</span>
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Created:
              {" "}
              {format(order.createdAt ?? "", "MMMM dd, yyyy")}
              {" "}
              · Updated:
              {" "}
              {format(order.updatedAt ?? "", "MMMM dd, yyyy")}
            </p>
          </div>
          <div className="grid gap-2 text-sm md:text-right">
            <div>
              <span className="font-medium">Status:</span>
              {" "}
              <span className="capitalize">{order.orderStatus}</span>
            </div>
            <div>
              <span className="font-medium">Payment:</span>
              {" "}
              <span className="capitalize">
                {order.paymentStatus}
                {" "}
                {order.paymentMethod && `(${order.paymentMethod})`}
              </span>
            </div>
            <div>
              <span className="font-medium">Items:</span>
              {" "}
              {orderItems.length}
            </div>
          </div>
        </section>

        <section className="parties-section mt-6 flex justify-between border-b pb-6 print:flex print:justify-between">
          <div className="space-y-1">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide">
              From
            </h2>
            <p className="font-medium">{OwnerInfo.name}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.address}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.city}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.email}</p>
            <p className="text-muted-foreground text-xs">{OwnerInfo.phone}</p>
          </div>
          <div className="space-y-1">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide">
              Bill To
            </h2>

            <p className="font-medium">{customer.name}</p>
            <p className="text-muted-foreground text-xs">
              {customer.address}
            </p>
            <p className="text-muted-foreground text-xs">{customer.city}</p>
            <p className="text-muted-foreground text-xs">
              {customer.email}
            </p>
            <p className="text-muted-foreground text-xs">
              {customer.phone}
            </p>
          </div>
          <div className="space-y-1">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide">
              Summary
            </h2>
            <p className="text-muted-foreground text-xs">Grand Total</p>
            <p className="font-medium">
              {formatCurrency(order.grandTotal, order.currency)}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <Table className="border-collapse text-sm">
            <TableHeader>
              <TableRow className="bg-muted/50 print:bg-transparent">
                {headerConfig.map(column => (
                  <TableHead key={column.label} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={item.id ?? `${item.productId}-${index}`} className="last:border-b-0">
                  <TableCell className="w-8 text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-40">
                      <div className="leading-tight font-medium">{item.product.title}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-12 tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right w-20 tabular-nums">
                    {formatCurrency(item.total, order.currency)}
                  </TableCell>
                  <TableCell className="text-right w-24 tabular-nums">
                    {order.discount + order.additionalDiscount === 0
                      ? "—"
                      : `- ${formatCurrency(order.discount + order.additionalDiscount, order.currency)}`}
                  </TableCell>
                  <TableCell className="text-right w-20 tabular-nums">
                    {order.tax === 0
                      ? "—"
                      : formatCurrency(order.tax, order.currency)}
                  </TableCell>
                  <TableCell className="text-right w-24 tabular-nums font-medium">
                    {formatCurrency(order.grandTotal, order.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="mt-8 flex flex-col gap-4 md:flex-row md:justify-end print:flex-row print:justify-end">
          <div className="w-full max-w-sm space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Subtotal</span>
              <span className="font-medium">
                {formatCurrency(order.basePrice, order.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Tax</span>
              <span className="font-medium">
                {formatCurrency(
                  order.tax,
                  order.currency,
                )}
              </span>
            </div>
            {order.discount + order.additionalDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">
                  -
                  {formatCurrency(
                    order.discount + order.additionalDiscount,
                    order.currency,
                  )}
                </span>
              </div>
            )}
            {order.shipping > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatCurrency(order.shipping, order.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base">
              <span className="font-semibold">Grand Total</span>
              <span className="font-semibold">
                {formatCurrency(order.grandTotal, order.currency)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <style>
        {`
        @media print {
          body { background: #fff; }
          header, .print-hidden { display: none !important; }
          main { padding: 0 !important; }
          table th, table td { font-size: 11px; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            .no-break { page-break-inside: avoid; }
          }
          @page { size: A4; margin: 16mm; }
      `}
      </style>
    </div>
  );
};
