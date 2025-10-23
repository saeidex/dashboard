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
import { sidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { collapsible, variant } = useLayout();
  const { display } = useSettingsStore();
  const user = useAuthStore(state => state.user);

  const filteredNavGroups = sidebarData.navGroups
    .map((group) => {
      if (isToggleableGroup(group.title)) {
        return {
          ...group,
          items: filterSidebarItems(group.items, display.sidebarItems),
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
        <NavUser user={user ?? sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
