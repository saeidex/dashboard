import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/web/components/ui/button";

export function PaymentsPrimaryButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="space-x-1" asChild>
        <Link to="/orders/$customerId" params={{ customerId: "all" }}>
          <ShoppingCart size={18} />
          <span>View Orders</span>
        </Link>
      </Button>
    </div>
  );
}
