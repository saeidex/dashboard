import { useSettingsStore } from '@/stores/settings-store'
import { filterSidebarItems, isToggleableGroup } from '@/lib/sidebar-utils'
import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const { display } = useSettingsStore()

  const filteredNavGroups = sidebarData.navGroups
    .map((group) => {
      if (isToggleableGroup(group.title)) {
        return {
          ...group,
          items: filterSidebarItems(group.items, display.sidebarItems),
        }
      }
      return group
    })
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
