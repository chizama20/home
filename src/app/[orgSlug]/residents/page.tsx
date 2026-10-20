import type { Metadata } from "next";

import { navItem } from "@/components/shell/nav-items";
import { SectionEmpty } from "@/components/shell/section-empty";

export const metadata: Metadata = { title: navItem("residents").label };

export default function ResidentsPage() {
  return (
    <SectionEmpty
      section="residents"
      title="No residents yet"
      description="Residents will be listed here, grouped by home."
    />
  );
}
