import { Plus } from "lucide-react";

import { Button } from "@/web/components/ui/button";

import { useSizes } from "./sizes-provider";

export function SizesPrimaryButtons() {
  const { setDialogType } = useSizes();

  return (
    <Button onClick={() => setDialogType("create")}>
      <Plus className="mr-2 h-4 w-4" />
      Add Size
    </Button>
  );
}
