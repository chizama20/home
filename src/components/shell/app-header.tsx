import { UserButton } from "@/features/auth/components/user-button";
import { HeaderFrame } from "./shell-frame";

interface AppHeaderProps {
  title: string;
  orgName: string;
  settingsHref: string;
}

// Page title on every screen. On phones it also carries the org name and the
// account menu, which live in the rail on wider screens. The home switcher
// joins it in Step 3.
export const AppHeader = ({ title, orgName, settingsHref }: AppHeaderProps) => (
  <HeaderFrame>
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground md:hidden">{orgName}</p>
      {title && <h1 className="truncate text-xl font-semibold">{title}</h1>}
    </div>
    <div className="md:hidden">
      <UserButton settingsHref={settingsHref} />
    </div>
  </HeaderFrame>
);
