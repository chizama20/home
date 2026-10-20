import type { Metadata } from "next";

import { navItem } from "@/components/shell/nav-items";
import { SectionEmpty } from "@/components/shell/section-empty";

export const metadata: Metadata = { title: navItem("time").label };

export default function TimePage() {
  return (
    <SectionEmpty
      section="time"
      title={{ admin: "No timesheets yet", staff: "No hours yet" }}
      description={{
        admin: "Hours and missed clock-outs will show here once staff start clocking in.",
        staff: "You'll clock in and out here and see your hours for each pay period.",
      }}
    />
  );
}
