import Link from "next/link";

import { cn } from "@/lib/utils";
import { UserButton } from "@/features/auth/components/user-button";
import { orgPath, type OrgSection } from "@/features/orgs/sections";
import type { NavItem } from "./nav-items";
import { RailFrame } from "./shell-frame";

interface AppRailProps {
  orgName: string;
  slug: string;
  items: readonly NavItem[];
  active: OrgSection | null;
}

export const AppRail = ({ orgName, slug, items, active }: AppRailProps) => (
  <RailFrame
    top={
      <>
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground"
        >
          {orgName.charAt(0).toUpperCase()}
        </span>
        <span className="sr-only truncate text-sm font-semibold text-sidebar-accent-foreground lg:not-sr-only">
          {orgName}
        </span>
      </>
    }
    bottom={<UserButton variant="rail" />}
  >
    <nav aria-label="Main">
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = item.section === active;
          return (
            <li key={item.section}>
              <Link
                href={orgPath(slug, item.section)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  "lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm",
                  isActive
                    ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={cn("size-5 shrink-0 lg:size-4", isActive && "text-sidebar-primary")}
                />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  </RailFrame>
);
