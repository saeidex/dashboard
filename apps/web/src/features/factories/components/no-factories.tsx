import { Factory, Plus } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { useFactories } from "./factories-provider";

export function NoFactories() {
  const { setOpen } = useFactories();
  return (
    <Empty className="from-muted/50 to-background h-full bg-linear-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Factory />
        </EmptyMedia>
        <EmptyTitle>No Factories</EmptyTitle>
        <EmptyDescription>
          There are no factories registered. Try adding a new factory.
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
          Add Factory
        </Button>
      </EmptyContent>
    </Empty>
  );
}
