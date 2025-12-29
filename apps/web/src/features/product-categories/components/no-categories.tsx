import { BookmarkX, Plus } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/web/components/ui/empty";

import { useCategories } from "./categories-provider";

export function NoCategories() {
  const { setOpen } = useCategories();
  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookmarkX />
        </EmptyMedia>
        <EmptyTitle>No Categories</EmptyTitle>
        <EmptyDescription>
          There are no categories. Try adding a new category.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => setOpen("create")} variant="outline" className="hover:text-foreground" size="sm">
          <Plus />
          Add Category
        </Button>
      </EmptyContent>
    </Empty>
  );
}
