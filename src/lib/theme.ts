import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

// The theme choices offered in the account menu, in display order.
export const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;
