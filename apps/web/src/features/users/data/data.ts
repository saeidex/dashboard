import type { userRoleSchema } from "@crm/api/schema";
import type { LucideProps } from "lucide-react";

import { Shield, Users } from "lucide-react";

export const roles: Array<{ label: Capitalize<userRoleSchema>; value: userRoleSchema; icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> }> = [
  {
    label: "Admin",
    value: "admin",
    icon: Shield,
  },
  {
    label: "User",
    value: "user",
    icon: Users,
  },
] as const;
