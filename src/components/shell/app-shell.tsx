"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";

import { useCurrentOrg } from "@/features/orgs/components/current-org-provider";
import { orgPath } from "@/features/orgs/sections";
import { AppHeader } from "./app-header";
import { AppRail } from "./app-rail";
import { MobileNav } from "./mobile-nav";
import { navItemsFor } from "./nav-items";
import { MAIN_CONTENT_ID, ShellFrame } from "./shell-frame";

// The frame around every /[orgSlug] page: navy rail (tablet and up), header,
// and the tab bar on phones.
export const AppShell = ({ children }: { children: ReactNode }) => {
  const { name, slug, role } = useCurrentOrg();
  const segment = useSelectedLayoutSegment();

  const items = navItemsFor(role);
  const activeItem = items.find((item) => item.section === segment) ?? null;
  const active = activeItem?.section ?? null;

  return (
    <>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <ShellFrame
        rail={<AppRail orgName={name} slug={slug} items={items} active={active} />}
        header={
          <AppHeader
            title={activeItem?.label ?? ""}
            orgName={name}
            settingsHref={orgPath(slug, "settings")}
          />
        }
        mobileNav={
          <MobileNav
            slug={slug}
            items={items.filter((item) => item.inMobileTabs)}
            active={active}
          />
        }
      >
        {children}
      </ShellFrame>
    </>
  );
};
