import { Plus } from "lucide-react";

import { Button } from "@/web/components/ui/button";

import { useDimensions } from "./dimensions-provider";

export function DimensionsPrimaryButtons() {
  const { setDialogType } = useDimensions();

  return (
    <Button onClick={() => setDialogType("create")}>
      <Plus className="mr-2 h-4 w-4" />
      Add Dimension
    </Button>
  );
}
