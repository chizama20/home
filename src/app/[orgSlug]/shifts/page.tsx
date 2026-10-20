import type { Metadata } from "next";

import { navItem } from "@/components/shell/nav-items";
import { SectionEmpty } from "@/components/shell/section-empty";

export const metadata: Metadata = { title: navItem("shifts").label };

export default function ShiftsPage() {
  return (
    <SectionEmpty
      section="shifts"
      title="No shifts yet"
      description={{
        admin: "Build each week's schedule here, then publish it to your team.",
        staff: "Your upcoming shifts and open shifts you can pick up will show here.",
      }}
    />
  );
}
