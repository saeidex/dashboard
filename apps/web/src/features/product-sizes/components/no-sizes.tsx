import { SizeIcon } from "@radix-ui/react-icons";
import { Plus } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/web/components/ui/empty";

import { useSizes } from "./sizes-provider";

export function NoSizes() {
  const { setOpen } = useSizes();
  return (
    <Empty className="from-muted/50 to-background  bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SizeIcon />
        </EmptyMedia>
        <EmptyTitle>No Sizes</EmptyTitle>
        <EmptyDescription>Create a size to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={() => setOpen("create")}
          variant="outline"
          className="hover:text-foreground"
          size="sm"
        >
          <Plus />
          Add Size
        </Button>
      </EmptyContent>
    </Empty>
  );
}
