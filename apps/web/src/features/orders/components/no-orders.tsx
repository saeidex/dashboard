import { useNavigate } from "@tanstack/react-router";
import { DollarSign, PackagePlus, Plus, UserCog2 } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { useOrders } from "./orders-provider";

export function NoOrders({
  reason,
}: {
  reason: "no-customers" | "no-orders" | "no-products";
}) {
  const navigate = useNavigate();
  const { setOpen } = useOrders();

  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DollarSign />
        </EmptyMedia>
        <EmptyTitle>No Orders</EmptyTitle>
        <EmptyDescription>
          {reason === "no-customers"
            && "You have no customers yet. Please add customers to start creating orders."}
          {reason === "no-products"
            && "You have no samples yet. Please add samples to start creating orders."}
          {reason === "no-orders"
            && "You have no orders yet. Please add an order to get started."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {reason === "no-customers" && (
          <Button
            variant="outline"
            size="sm"
            className="hover:text-foreground"
            onClick={() => navigate({ to: "/customers" })}
          >
            <UserCog2 />
            Manage Customers
          </Button>
        )}
        {reason === "no-products" && (
          <Button
            variant="outline"
            size="sm"
            className="hover:text-foreground"
            onClick={() => navigate({ to: "/products" })}
          >
            <PackagePlus />
            Manage Samples
          </Button>
        )}
        {reason === "no-orders" && (
          <Button
            variant="outline"
            size="sm"
            className="hover:text-foreground"
            onClick={() => setOpen("add")}
          >
            <Plus />
            Add Order
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
