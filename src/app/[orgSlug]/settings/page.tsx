import type { Metadata } from "next";

import { navItem } from "@/components/shell/nav-items";
import { SectionEmpty } from "@/components/shell/section-empty";

export const metadata: Metadata = { title: navItem("settings").label };

export default function SettingsPage() {
  return (
    <SectionEmpty
      section="settings"
      title="No settings yet"
      description={{
        admin: "Organization and home settings will be here. To change the theme, open your account menu.",
        staff: "Your profile will be here. To change the theme, open your account menu.",
      }}
    />
  );
}
