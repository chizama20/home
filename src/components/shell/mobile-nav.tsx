import Link from "next/link";

import { cn } from "@/lib/utils";
import { orgPath, type OrgSection } from "@/features/orgs/sections";
import type { NavItem } from "./nav-items";
import { MobileNavFrame } from "./shell-frame";

interface MobileNavProps {
  slug: string;
  items: readonly NavItem[];
  active: OrgSection | null;
}

// Bottom tab bar for phones, like Homebase's app: one tap to any area and in
// thumb reach. Settings lives in the account menu so five tabs fit at 375px.
export const MobileNav = ({ slug, items, active }: MobileNavProps) => (
  <MobileNavFrame>
    <nav aria-label="Main">
      <ul className="flex">
        {items.map((item) => {
          const isActive = item.section === active;
          return (
            <li key={item.section} className="min-w-0 flex-1">
              <Link
                href={orgPath(slug, item.section)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  isActive
                    ? "font-semibold text-primary before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon aria-hidden="true" className="size-5 shrink-0" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  </MobileNavFrame>
);
