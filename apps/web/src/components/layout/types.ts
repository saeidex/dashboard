import type { LinkProps } from "@tanstack/react-router";

import type { AuthUser } from "@/web/stores/auth-store";

type Team = {
  name: string;
  logo: React.ElementType;
  plan: string;
};

type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  className?: string;
};

type NavLink = BaseNavItem & {
  url: LinkProps["to"] | (string & {});
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps["to"] | (string & {}) })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

type NavGroup = {
  title: string;
  items: NavItem[];
};

type SidebarData = {
  user?: AuthUser;
  teams?: Team[];
  navGroups: NavGroup[];
};

export type { NavCollapsible, NavGroup, NavItem, NavLink, SidebarData };
