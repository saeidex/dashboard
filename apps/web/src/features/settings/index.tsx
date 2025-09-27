import { Outlet } from "@tanstack/react-router";
import { Monitor, Palette } from "lucide-react";

import { Header } from "@/web/components/layout/header";
import { Main } from "@/web/components/layout/main";
import { Separator } from "@/web/components/ui/separator";

import { SidebarNav } from "./components/sidebar-nav";

const sidebarNavItems = [
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: <Palette size={18} />,
  },
  {
    title: "Display",
    href: "/settings/display",
    icon: <Monitor size={18} />,
  },
];

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>{/* Breadcrumb */}</Header>

      <Main fixed>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          <aside className="top-0 lg:sticky lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex w-full overflow-y-hidden p-1">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  );
}
