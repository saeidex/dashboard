import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { Card, CardContent } from "@/web/components/ui/card";

import { customersQueryOptions } from "../customers/data/queries";

export function CustomersGrid() {
  const { data: customers } = useSuspenseQuery(customersQueryOptions);

  if (!customers || customers.length === 0) {
    return null;
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
