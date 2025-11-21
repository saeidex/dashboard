import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/web/components/ui/table";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

import { OwnerInfo } from "../data/data";

type InvoiceProps = {
  order: Order;
  printRef?: React.RefObject<HTMLDivElement | null>;
  monochrome?: boolean;
};

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
  monochrome = false,
}: InvoiceProps) => {
  const customer = order.customer;
  const orderItems = order.items;

  const headerConfig = [
    { label: "#", className: "w-8" },
    { label: "Item", className: "" },
    { label: "Qty", className: "text-right w-12" },
    { label: "Unit Price", className: "text-right w-24" },
    { label: "Tax / Unit", className: "text-right w-24" },
    { label: "Total Tax", className: "text-right w-24" },
    { label: "Subtotal (no tax)", className: "text-right w-28" },
    { label: "Total (with tax)", className: "text-right w-32" },
  ] as const;

  return (
    <div className="print:pt-0">
      <div
        ref={printRef}
        className={cn(
          "relative mx-auto w-full max-w-4xl rounded-lg border p-6 shadow-sm bg-background print:max-w-none print:border-0 print:p-0 print:shadow-none print:bg-transparent",
          monochrome && "invoice-monochrome bg-white text-black shadow-none",
        )}
      >
        <section
          className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between print:flex-row print:items-start print:justify-between"
          data-invoice-divider={monochrome ? "" : undefined}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
            <h2
              className={cn(
                "text-2xl font-light",
                !monochrome && "text-muted-foreground",
              )}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              Order
              {" "}
              <span className="font-medium">{order.id}</span>
            </h2>
            <p
              className={cn("mt-1 text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
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

        <section
          className="parties-section mt-6 flex justify-between border-b pb-6 print:flex print:justify-between"
          data-invoice-divider={monochrome ? "" : undefined}
        >
          <div className="space-y-1">
            <h2
              className={cn(
                "text-sm font-semibold tracking-wide",
                !monochrome && "text-muted-foreground",
              )}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              From
            </h2>
            <p className="font-medium">{OwnerInfo.name}</p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {OwnerInfo.address}
            </p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {OwnerInfo.city}
            </p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {OwnerInfo.email}
            </p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {OwnerInfo.phone}
            </p>
          </div>
          <div className="space-y-1">
            <h2
              className={cn(
                "text-sm font-semibold tracking-wide",
                !monochrome && "text-muted-foreground",
              )}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              Bill To
            </h2>

            <p className="font-medium">{customer.name}</p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {customer.address}
            </p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {customer.city}
            </p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {customer.email}
            </p>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              {customer.phone}
            </p>
          </div>
          <div className="space-y-1">
            <h2
              className={cn(
                "text-sm font-semibold tracking-wide",
                !monochrome && "text-muted-foreground",
              )}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              Summary
            </h2>
            <p
              className={cn("text-xs", !monochrome && "text-muted-foreground")}
              data-invoice-muted={monochrome ? "" : undefined}
            >
              Grand Total
            </p>
            <p className="font-medium">
              {formatCurrency(order.grandTotal, order.currency)}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <Table className="border-collapse text-sm">
            <TableHeader>
              <TableRow
                className={cn(
                  "print:bg-transparent",
                  !monochrome && "bg-muted/50",
                )}
                data-invoice-table-header={monochrome ? "" : undefined}
              >
                {headerConfig.map(column => (
                  <TableHead key={column.label} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow
                  key={item.id ?? `${item.productId}-${index}`}
                  className={cn("last:border-b-0", monochrome && "hover:bg-transparent")}
                  data-invoice-table-row={monochrome ? "" : undefined}
                >
                  <TableCell
                    className={cn("w-8", !monochrome && "text-muted-foreground")}
                    data-invoice-muted={monochrome ? "" : undefined}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-40">
                      <div className="leading-tight font-medium">{item.product.title}</div>
                      {item.product.dimension && (
                        <div
                          className={cn(
                            "text-xs mt-0.5",
                            !monochrome && "text-muted-foreground",
                          )}
                          data-invoice-muted={monochrome ? "" : undefined}
                        >
                          Dimensions:
                          {" "}
                          {item.product.dimension.length}
                          {" "}
                          ×
                          {" "}
                          {item.product.dimension.width}
                          {" "}
                          ×
                          {" "}
                          {item.product.dimension.height}
                          {" "}
                          {item.product.dimension.unit}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-12 tabular-nums">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right w-24 tabular-nums">
                    {formatCurrency(item.retailPricePerUnit ?? 0, order.currency)}
                  </TableCell>
                  <TableCell className="text-right w-24 tabular-nums">
                    {item.taxPerUnit && item.taxPerUnit > 0
                      ? formatCurrency(item.taxPerUnit, order.currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right w-24 tabular-nums">
                    {item.totalTax && item.totalTax > 0
                      ? formatCurrency(item.totalTax, order.currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right w-28 tabular-nums">
                    {formatCurrency(item.totalRetailPrice ?? 0, order.currency)}
                  </TableCell>
                  <TableCell className="text-right w-32 tabular-nums font-medium">
                    {formatCurrency(item.grandTotal ?? (item.totalRetailPrice ?? 0) + (item.totalTax ?? 0), order.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="mt-8 flex flex-col gap-4 md:flex-row md:justify-end print:flex-row print:justify-end">
          <div className="w-full max-w-sm space-y-1 text-sm">
            <div className="flex justify-between">
              <span
                className={cn(!monochrome && "text-muted-foreground")}
                data-invoice-muted={monochrome ? "" : undefined}
              >
                Items Subtotal
              </span>
              <span className="font-medium">
                {formatCurrency(order.retailPrice, order.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={cn(!monochrome && "text-muted-foreground")}
                data-invoice-muted={monochrome ? "" : undefined}
              >
                Items Tax
              </span>
              <span className="font-medium">
                {formatCurrency(
                  order.tax,
                  order.currency,
                )}
              </span>
            </div>
            {order.shipping > 0 && (
              <div className="flex justify-between">
                <span
                  className={cn(!monochrome && "text-muted-foreground")}
                  data-invoice-muted={monochrome ? "" : undefined}
                >
                  Shipping
                </span>
                <span className="font-medium">
                  {formatCurrency(order.shipping, order.currency)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between border-t pt-2 text-base"
              data-invoice-summary={monochrome ? "" : undefined}
            >
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
        .invoice-monochrome,
        .invoice-monochrome * {
          color: #000 !important;
          background-color: #fff !important;
          border-color: #000 !important;
          box-shadow: none !important;
          background-image: none !important;
        }
        .invoice-monochrome [data-invoice-muted] {
          color: #4b5563 !important;
        }
        .invoice-monochrome [data-invoice-divider] {
          border-color: #d1d5db !important;
        }
        .invoice-monochrome [data-invoice-table-header] {
          background-color: #f3f4f6 !important;
        }
        .invoice-monochrome [data-invoice-table-row] {
          border-color: #e5e7eb !important;
        }
        .invoice-monochrome [data-invoice-summary] {
          border-color: #d1d5db !important;
        }
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
