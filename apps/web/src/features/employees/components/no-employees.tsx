import { IdCard, Plus, UserRound } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { useEmployees } from "./employees-provider";

export function NoEmployees() {
  const { setOpen } = useEmployees();
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IdCard />
        </EmptyMedia>
        <EmptyTitle>No Employees</EmptyTitle>
        <EmptyDescription>
          There no employees. Try adding a new employee.
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
          Add Employee
        </Button>
      </EmptyContent>
    </Empty>
  );
}
