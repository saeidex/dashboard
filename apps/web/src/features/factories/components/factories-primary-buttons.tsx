import { Factory } from "lucide-react";

import { Button } from "@/web/components/ui/button";

import { useFactories } from "./factories-provider";

export function FactoriesPrimaryButtons() {
  const { setOpen } = useFactories();
  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen("add")}>
        <span>Add Factory</span>
        {" "}
        <Factory size={18} />
      </Button>
    </div>
  );
}
