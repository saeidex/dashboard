import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight, UserCog2, UserRound } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import { Card, CardContent } from "@/web/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { customersQueryOptions } from "../customers/data/queries";

export function NoCustomers() {
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UserRound />
        </EmptyMedia>
        <EmptyTitle>No Customers</EmptyTitle>
        <EmptyDescription>
          There no customers. Try adding a new customer.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/customers">
          <Button variant="outline" size="sm">
            <UserCog2 />
            Manage Customers
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
}

export function CustomersGrid() {
  const { data: customers } = useSuspenseQuery(customersQueryOptions);

  if (!customers || customers.length === 0) {
    return <NoCustomers />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {customers.map(customer => (
        <Link to="/orders/$customerId" params={{ customerId: customer.id }} key={customer.id}>
          <Card className="cursor-pointer">
            <CardContent className="flex flex-1 justify-between items-center">
              {customer.name}
              <span className="flex gap-1"><ChevronRight /></span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
