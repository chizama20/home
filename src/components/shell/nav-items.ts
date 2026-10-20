import {
  CalendarDaysIcon,
  ClockIcon,
  HeartHandshakeIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import type { CurrentOrg } from "@/features/orgs/components/current-org-provider";
import type { OrgSection } from "@/features/orgs/sections";

export type NavItem = {
  section: OrgSection;
  // Also the page title in the header and the browser tab.
  label: string;
  icon: LucideIcon;
  adminOnly: boolean;
  // Phones show Settings in the account menu so the tab bar fits at 375px.
  inMobileTabs: boolean;
};

// Rail order from PLAN.md §7. Hiding admin items is convenience, not security.
const NAV_ITEMS: readonly NavItem[] = [
  { section: "dash", label: "Dash", icon: LayoutDashboardIcon, adminOnly: false, inMobileTabs: true },
  { section: "shifts", label: "Shifts", icon: CalendarDaysIcon, adminOnly: false, inMobileTabs: true },
  { section: "time", label: "Time", icon: ClockIcon, adminOnly: false, inMobileTabs: true },
  { section: "residents", label: "Residents", icon: HeartHandshakeIcon, adminOnly: false, inMobileTabs: true },
  { section: "team", label: "Team", icon: UsersIcon, adminOnly: true, inMobileTabs: true },
  { section: "settings", label: "Settings", icon: SettingsIcon, adminOnly: false, inMobileTabs: false },
];

export const navItemsFor = (role: CurrentOrg["role"]) =>
  NAV_ITEMS.filter((item) => !item.adminOnly || role === "admin");

export const navItem = (section: OrgSection): NavItem => {
  const item = NAV_ITEMS.find((candidate) => candidate.section === section);
  if (item === undefined) throw new Error(`No nav item for "${section}"`);
  return item;
};

