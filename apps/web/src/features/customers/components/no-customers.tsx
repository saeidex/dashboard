import { Plus, UserRound } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { useCustomers } from "./customers-provider";

export function NoCustomers() {
  const { setOpen } = useCustomers();
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
        <Button
          variant="outline"
          size="sm"
          className="hover:text-foreground"
          onClick={() => setOpen("add")}
        >
          <Plus />
          Add Customer
        </Button>
      </EmptyContent>
    </Empty>
  );
}
