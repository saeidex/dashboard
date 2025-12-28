import { Plus, Wallet2 } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { useExpenses } from "./expenses-provider";

export function NoExpenses() {
  const { setOpen } = useExpenses();
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Wallet2 />
        </EmptyMedia>
        <EmptyTitle>No Expenses</EmptyTitle>
        <EmptyDescription>
          There no expenses. Try adding a new expense.
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
          Add Expense
        </Button>
      </EmptyContent>
    </Empty>
  );
}
