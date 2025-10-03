import {
  AudioWaveform,
  Bookmark,
  Bug,
  Command,
  Construction,
  DollarSign,
  FileX,
  GalleryVerticalEnd,
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
  user: {
    id: "1",
    name: "Example",
    email: "example@mail.com",
    image: "/avatars/example.jpg",
    emailVerified: false,
    role: ["admin"],
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  },
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
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
          title: "Orders",
          url: "/orders",
          icon: DollarSign,
        },
        {
          title: "Products",
          url: "/products",
          icon: Package,
        },
        {
          title: "Product Categories",
          url: "/categories",
          icon: Bookmark,
        },
        {
          title: "Employees",
          url: "/employees",
          icon: IdCard,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: UsersRound,
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
            // {
            //   title: 'Sales',
            //   url: '/accounts/sales',
            //   icon: Coins,
            // },
          ],
        },
        // {
        //   title: 'Reports',
        //   url: '/reports',
        //   icon: FileX,
        // },
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
