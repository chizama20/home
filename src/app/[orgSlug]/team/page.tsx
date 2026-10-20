import type { Metadata } from "next";

import { navItem } from "@/components/shell/nav-items";
import { SectionEmpty } from "@/components/shell/section-empty";
import { AdminOnly } from "@/features/orgs/components/admin-only";

export const metadata: Metadata = { title: navItem("team").label };

export default function TeamPage() {
  return (
    <AdminOnly>
      <SectionEmpty
        section="team"
        title="Just you so far"
        description="Members, invites and roles for your organization will be managed here."
      />
    </AdminOnly>
  );
}
