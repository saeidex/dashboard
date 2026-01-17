import { Link } from "@tanstack/react-router";
import { CreditCard, ShoppingCart } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

export function NoPayments() {
  return (
    <Empty className="from-muted/50 to-background h-full bg-linear-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CreditCard />
        </EmptyMedia>
        <EmptyTitle>No Payments Yet</EmptyTitle>
        <EmptyDescription>
          Payment records appear here when you record payments for orders. Go to
          the Orders page and click the "Pay" button on an order to record a
          payment.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          size="sm"
          className="hover:text-foreground"
          asChild
        >
          <Link to="/orders/$customerId" params={{ customerId: "all" }}>
            <ShoppingCart />
            View Orders
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
