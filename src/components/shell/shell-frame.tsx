import type { ReactNode } from "react";

// Layout boxes shared by the shell and its loading skeleton, so nothing moves
// when the org finishes loading.
//
// Phones (< md): header on top, tab bar at the bottom, no rail.
// Tablets (md): compact rail, icon over label.
// Desktop (lg+): full rail, icon beside label.

export const MAIN_CONTENT_ID = "main-content";

interface ShellFrameProps {
  rail: ReactNode;
  header: ReactNode;
  mobileNav: ReactNode;
  children: ReactNode;
}

export const ShellFrame = ({ rail, header, mobileNav, children }: ShellFrameProps) => (
  <div className="flex h-dvh overflow-hidden">
    {rail}
    <div className="flex min-w-0 flex-1 flex-col">
      {header}
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="flex-1 overflow-y-auto p-4 outline-none md:p-6"
      >
        {children}
      </main>
      {mobileNav}
    </div>
  </div>
);

interface RailFrameProps {
  top: ReactNode;
  bottom: ReactNode;
  children: ReactNode;
}

export const RailFrame = ({ top, bottom, children }: RailFrameProps) => (
  <aside className="hidden w-20 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex lg:w-56">
    <div className="flex h-14 shrink-0 items-center justify-center gap-2 border-b border-sidebar-border px-3 lg:justify-start lg:px-4">
      {top}
    </div>
    <div className="flex-1 overflow-y-auto p-2">{children}</div>
    <div className="shrink-0 border-t border-sidebar-border p-2">{bottom}</div>
  </aside>
);

export const HeaderFrame = ({ children }: { children: ReactNode }) => (
  <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 md:px-6">
    {children}
  </header>
);

export const MobileNavFrame = ({ children }: { children: ReactNode }) => (
  <div className="shrink-0 border-t border-border bg-card md:hidden">{children}</div>
);
