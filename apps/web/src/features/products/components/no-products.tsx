import { useNavigate } from "@tanstack/react-router";
import { BookmarkPlus, Package, Plus } from "lucide-react";

import { Button } from "@/web/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/web/components/ui/empty";

import { useProducts } from "./products-provider";

export function NoProducts({
  reason,
}: {
  reason: "no-categories" | "no-products";
}) {
  const navigate = useNavigate();
  const { setOpen } = useProducts();

  return (
    <Empty className="from-muted/50 to-background  bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Package />
        </EmptyMedia>
        <EmptyTitle>No Samples</EmptyTitle>
        <EmptyDescription>
          {reason === "no-categories"
            && "You need to create categories before adding samples."}
          {reason === "no-products"
            && "You have not added any samples yet. Start by adding a new sample."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {reason === "no-categories" && (
          <Button
            onClick={() => navigate({ to: "/categories" })}
            variant="outline"
            className="hover:text-foreground"
            size="sm"
          >
            <BookmarkPlus />
            Manage Categories
          </Button>
        )}
        {reason === "no-products" && (
          <Button
            variant="outline"
            className="hover:text-foreground"
            size="sm"
            onClick={() => setOpen("create")}
          >
            <Plus />
            Add Sample
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}
