import { SizeIcon } from "@radix-ui/react-icons";
import {
  Bookmark,
  Bug,
  Construction,
  CreditCard,
  DollarSign,
  Factory,
  FileX,
  IdCard,
  LayoutDashboard,
  Lock,
  Monitor,
  Package,
  Palette,
  ServerOff,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
  UserX,
  WalletCards,
  WalletMinimal,
} from "lucide-react";

import type { SidebarData } from "../types";

const devOnlyPages = () => {
  if (import.meta.env.PROD) {
    return [];
  }
  return [
    {
      title: "Pages",
      items: [
        {
          title: "Auth",
          icon: ShieldCheck,
          items: [
            {
              title: "Sign In",
              url: "/sign-in",
            },
            {
              title: "Forgot Password",
              url: "/forgot-password",
            },
            {
              title: "OTP",
              url: "/otp",
            },
          ],
        },
        {
          title: "Errors",
          icon: Bug,
          items: [
            {
              title: "Unauthorized",
              url: "/errors/unauthorized",
              icon: Lock,
            },
            {
              title: "Forbidden",
              url: "/errors/forbidden",
              icon: UserX,
            },
            {
              title: "Not Found",
              url: "/errors/not-found",
              icon: FileX,
            },
            {
              title: "Internal Server Error",
              url: "/errors/internal-server-error",
              icon: ServerOff,
            },
            {
              title: "Maintenance Error",
              url: "/errors/maintenance-error",
              icon: Construction,
            },
          ],
        },
      ],
    },
  ];
};

export const sidebarData: SidebarData = {
//   user: {
//     id: "1",
//     name: "Example",
//     email: "example@mail.com",
//     image: "/avatars/example.jpg",
//     emailVerified: false,
//     role: "admin",
//     banned: false,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   teams: [
//     {
//       name: "Shadcn Admin",
//       logo: Command,
//       plan: "Vite + ShadcnUI",
//     },
//     {
//       name: "Acme Inc",
//       logo: GalleryVerticalEnd,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//   ],
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: UsersRound,
        },
        {
          title: "Orders",
          url: "/orders",
          icon: DollarSign,
        },
        {
          title: "Samples",
          url: "/products",
          icon: Package,
        },
        {
          title: "Sample's Categories",
          url: "/categories",
          icon: Bookmark,
        },
        {
          title: "Sample Sizes",
          url: "/sizes",
          icon: SizeIcon,
        },
        {
          title: "Factories",
          url: "/factories",
          icon: Factory,
        },
        {
          title: "Employees",
          url: "/employees",
          icon: IdCard,
        },
        {
          title: "Accounts",
          icon: WalletCards,
          items: [
            {
              title: "Expenses",
              url: "/accounts/expenses",
              icon: WalletMinimal,
            },
            {
              title: "Sales",
              url: "/accounts/payments",
              icon: CreditCard,
            },
          ],
        },
        {
          title: "Software Users",
          url: "/users",
          icon: Users,
        },
      ],
    },
    ...devOnlyPages(),
    {
      title: "Other",
      items: [
        {
          title: "Settings",
          icon: Settings,
          items: [
            {
              title: "Appearance",
              url: "/settings/appearance",
              icon: Palette,
            },
            {
              title: "Display",
              url: "/settings/display",
              icon: Monitor,
            },
          ],
        },
      ],
    },
  ],
};
