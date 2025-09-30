import type { UserRole } from "@crm/api/schema";
import type { LucideProps } from "lucide-react";

import { Shield, UserCheck, Users } from "lucide-react";

export const roles: Array<{ label: Capitalize<UserRole>; value: UserRole; icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> }> = [
  {
    label: "Superadmin",
    value: "superadmin",
    icon : Shield,
  },
  {
    label: "Admin",
    value: "admin",
    icon : UserCheck,
  },
  {
    label: "Manager",
    value: "manager",
    icon : Users,
  },
] as const;
