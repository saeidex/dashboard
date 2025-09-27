import type { NavItem, SidebarData } from "@/web/components/layout/types";

export const TOGGLEABLE_GROUPS = ["General"];

export function extractSidebarItems(
  sidebarData: SidebarData,
  toggleableGroups: string[] = TOGGLEABLE_GROUPS,
): { id: string; label: string }[] {
  const items: { id: string; label: string }[] = [];

  sidebarData.navGroups.forEach((group) => {
    if (toggleableGroups.includes(group.title)) {
      group.items.forEach((item) => {
        if (item.url && !item.items) {
          items.push({
            id: item.title.toLowerCase().replace(/\s+/g, "-"),
            label: item.title,
          });
        }

        if (item.items) {
          item.items.forEach((child) => {
            if (child.url) {
              items.push({
                id: `${item.title.toLowerCase().replace(/\s+/g, "-")}-${child.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`,
                label: `${item.title} / ${child.title}`,
              });
            }
          });
        }
      });
    }
  });

  return items;
}

export function isToggleableGroup(
  groupTitle: string,
  toggleableGroups: string[] = TOGGLEABLE_GROUPS,
): boolean {
  return toggleableGroups.includes(groupTitle);
}

export function filterSidebarItems(
  navItems: NavItem[],
  visibleItemIds: string[],
): NavItem[] {
  // Build a set of normalized IDs for quick lookup
  const idSet = new Set(visibleItemIds);

  // Helper to build ID in the same way as extractSidebarItems
  const toId = (title: string) => title.toLowerCase().replace(/\s+/g, "-");

  return navItems
    .map((item) => {
      if (item.url && !item.items) {
        // Simple link: keep only if its ID is selected
        const id = toId(item.title);
        return idSet.has(id) ? item : null;
      }
      if (item.items) {
        // Collapsible: filter its children
        const parentId = toId(item.title);
        const filteredChildren = item.items.filter((child) => {
          const childId = `${parentId}-${toId(child.title)}`;
          return idSet.has(childId);
        });
        if (filteredChildren.length === 0)
          return null;
        return { ...item, items: filteredChildren };
      }
      return null;
    })
    .filter((v): v is NavItem => v !== null);
}
