import { type NavItem, type SidebarData } from '@/components/layout/types'

export const TOGGLEABLE_GROUPS = ['General']

export function extractSidebarItems(
  sidebarData: SidebarData,
  toggleableGroups: string[] = TOGGLEABLE_GROUPS
): { id: string; label: string }[] {
  const items: { id: string; label: string }[] = []

  sidebarData.navGroups.forEach((group) => {
    if (toggleableGroups.includes(group.title)) {
      group.items.forEach((item) => {
        if (item.url && !item.items) {
          items.push({
            id: item.title.toLowerCase().replace(/\s+/g, '-'),
            label: item.title,
          })
        }
      })
    }
  })

  return items
}

export function isToggleableGroup(
  groupTitle: string,
  toggleableGroups: string[] = TOGGLEABLE_GROUPS
): boolean {
  return toggleableGroups.includes(groupTitle)
}

export function filterSidebarItems(
  navItems: NavItem[],
  visibleItemIds: string[]
): NavItem[] {
  const visibleTitles = visibleItemIds.map((id) =>
    id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )

  return navItems.filter((item) => {
    if (item.url && !item.items) {
      return visibleTitles.includes(item.title)
    }
    return !!item.items
  })
}
