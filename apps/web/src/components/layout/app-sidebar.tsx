import { redirect } from "@tanstack/react-router";
import { ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/web/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/web/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/web/components/ui/tooltip";
import { useLayout } from "@/web/context/layout-provider";
import { filterSidebarItems, isToggleableGroup } from "@/web/lib/sidebar-utils";
import { useAuthStore } from "@/web/stores/auth-store";
import { useSettingsStore } from "@/web/stores/settings-store";

import { AppTitle } from "./app-title";
import { useSidebarData } from "./hooks/use-sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      setShowScrollTop(contentRef.current.scrollTop > 100);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.addEventListener("scroll", handleScroll);
      return () => content.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);
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
      <SidebarContent ref={contentRef} className="relative">
        {filteredNavGroups.map(props => (
          <NavGroup key={props.title} {...props} />
        ))}
        {showScrollTop && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-16 left-4 z-10 size-8 rounded-full shadow-md transition-opacity group-data-[collapsible=icon]:hidden"
                onClick={scrollToTop}
              >
                <ChevronUp className="size-4" />
                <span className="sr-only">Scroll to top</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Scroll to top</TooltipContent>
          </Tooltip>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
