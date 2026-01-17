import { redirect } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/web/components/ui/sidebar";
import { useLayout } from "@/web/context/layout-provider";
import { filterSidebarItems, isToggleableGroup } from "@/web/lib/sidebar-utils";
import { useAuthStore } from "@/web/stores/auth-store";
import { useSettingsStore } from "@/web/stores/settings-store";

import { AppTitle } from "./app-title";
import { useSidebarData } from "./hooks/use-sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { display } = useSettingsStore();
  const user = useAuthStore(state => state.user);
  const { navGroups } = useSidebarData();

  if (!user) {
    throw redirect({ to: "/sign-in" });
  }

  const filteredNavGroups = navGroups
    .map((group) => {
      if (isToggleableGroup(group.title)) {
        const filteredItems = filterSidebarItems(group.items, display.sidebarItems);

        // Always include Orders (dynamic collapsible) even if not in settings
        const ordersItem = group.items.find(item => item.title === "Orders");
        const hasOrders = filteredItems.some(item => item.title === "Orders");

        return {
          ...group,
          items: hasOrders || !ordersItem
            ? filteredItems
            : [...filteredItems, ordersItem],
        };
      }
      return group;
    })
    .filter(group => group.items.length > 0);

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map(props => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
