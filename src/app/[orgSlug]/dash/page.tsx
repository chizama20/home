import type { Metadata } from "next";

import { navItem } from "@/components/shell/nav-items";
import { SectionEmpty } from "@/components/shell/section-empty";

export const metadata: Metadata = { title: navItem("dash").label };

export default function DashPage() {
  return (
    <SectionEmpty
      section="dash"
      title="Nothing scheduled yet"
      description={{
        admin: "Who's working now, open shifts and requests will show here once your homes and shifts are set up.",
        staff: "Your next shift and the clock-in button will show here once you're on the schedule.",
      }}
    />
  );
}
