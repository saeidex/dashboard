import type { Row } from "@tanstack/react-table";

import { CreditCard, RotateCcw } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { cn } from "@/web/lib/utils";

import type { Order } from "../data/schema";

import { useOrders } from "./orders-provider";

type OrderPayButtonProps = {
  row: Row<Order>;
};

export function OrderPayButton({ row }: OrderPayButtonProps) {
  const { setOpen, setCurrentRow } = useOrders();
  const paymentStatus = row.original.paymentStatus;

  const handlePayClick = () => {
    setCurrentRow(row.original);
    setOpen("pay");
  };

  const handleRefundClick = () => {
    setCurrentRow(row.original);
    setOpen("refund");
  };

  // Show refund button for paid or partial orders
  const showRefund = paymentStatus === "paid" || paymentStatus === "partial";
  // Show pay button for unpaid or partial orders
  const showPay = paymentStatus === "unpaid" || paymentStatus === "partial";

  if (!showPay && !showRefund) {
    return null;
  }

  return (
    <div className="flex gap-1">
      {showPay && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 gap-1 px-2 text-xs",
                paymentStatus === "unpaid"
                && "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900",
                paymentStatus === "partial"
                && "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400 dark:hover:bg-yellow-900",
              )}
              onClick={handlePayClick}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Pay
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {paymentStatus === "unpaid"
              ? "Record payment for this order"
              : "Add additional payment"}
          </TooltipContent>
        </Tooltip>
      )}
      {showRefund && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2 text-xs border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400 dark:hover:bg-purple-900"
              onClick={handleRefundClick}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Refund
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {paymentStatus === "paid"
              ? "Issue refund for this order"
              : "Issue partial refund"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
