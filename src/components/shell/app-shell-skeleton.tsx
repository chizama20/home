import { Skeleton } from "@/components/ui/skeleton";
import { HeaderFrame, MobileNavFrame, RailFrame, ShellFrame } from "./shell-frame";

const RAIL_ITEMS = 6;
const TAB_ITEMS = 5;

// Shown while the org loads, during sign-out and while redirecting away.
export const AppShellSkeleton = () => (
  <>
    <span role="status" className="sr-only">
      Loading
    </span>
    <ShellFrame
      rail={
        <RailFrame
          top={
            <>
              <Skeleton className="size-8 shrink-0 bg-sidebar-accent" />
              <Skeleton className="hidden h-4 flex-1 bg-sidebar-accent lg:block" />
            </>
          }
          bottom={
            <div className="flex h-11 items-center justify-center gap-2 px-2 lg:justify-start">
              <Skeleton className="size-8 shrink-0 rounded-full bg-sidebar-accent" />
              <Skeleton className="hidden h-4 flex-1 bg-sidebar-accent lg:block" />
            </div>
          }
        >
          <div className="space-y-1">
            {Array.from({ length: RAIL_ITEMS }, (_, i) => (
              <div
                key={i}
                className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-2 lg:flex-row lg:justify-start lg:gap-3 lg:px-3"
              >
                <Skeleton className="size-5 shrink-0 bg-sidebar-accent lg:size-4" />
                <Skeleton className="h-3 w-10 bg-sidebar-accent lg:h-4 lg:w-20" />
              </div>
            ))}
          </div>
        </RailFrame>
      }
      header={
        <HeaderFrame>
          <div className="min-w-0 space-y-1">
            <Skeleton className="h-3 w-24 md:hidden" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center md:hidden">
            <Skeleton className="size-8 rounded-full" />
          </div>
        </HeaderFrame>
      }
      mobileNav={
        <MobileNavFrame>
          <div className="flex">
            {Array.from({ length: TAB_ITEMS }, (_, i) => (
              <div key={i} className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1">
                <Skeleton className="size-5" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </MobileNavFrame>
      }
    >
      <Skeleton className="h-64 w-full rounded-lg" />
    </ShellFrame>
  </>
);
