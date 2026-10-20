"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  useCurrentOrg,
  type CurrentOrg,
} from "@/features/orgs/components/current-org-provider";
import type { OrgSection } from "@/features/orgs/sections";
import { navItem } from "./nav-items";

type RoleText = string | Record<CurrentOrg["role"], string>;

interface SectionEmptyProps {
  section: OrgSection;
  title: RoleText;
  description: RoleText;
}

// The empty state for a whole section, with copy per role where admins and
// staff use the section differently.
export const SectionEmpty = ({ section, title, description }: SectionEmptyProps) => {
  const { role } = useCurrentOrg();
  const Icon = navItem(section).icon;
  const forRole = (text: RoleText) => (typeof text === "string" ? text : text[role]);

  return (
    <Empty className="min-h-64 border border-border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{forRole(title)}</EmptyTitle>
        <EmptyDescription>{forRole(description)}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
