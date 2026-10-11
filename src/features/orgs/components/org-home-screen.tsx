"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/features/auth/components/user-button";
import { useResolveSlug } from "../api/use-resolve-slug";

const ROLE_LABELS = { admin: "Admin", staff: "Staff" } as const;

interface OrgHomeScreenProps {
  slug: string;
}

// Placeholder org page until the Step 2 shell replaces it.
export const OrgHomeScreen = ({ slug }: OrgHomeScreenProps) => {
  const router = useRouter();
  const { data: org } = useResolveSlug(slug);

  // Not a member, no such org, or a non-canonical URL: same answer for all.
  useEffect(() => {
    if (org === null) router.replace("/");
  }, [org, router]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6">
        {org ? (
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold">{org.name}</h1>
            <p className="text-sm text-muted-foreground">{ROLE_LABELS[org.role]}</p>
          </div>
        ) : (
          // Loading, signing out, or about to redirect away.
          <div className="min-w-0 space-y-1.5" aria-busy="true">
            <span role="status" className="sr-only">
              Loading
            </span>
            <Skeleton className="h-6 w-48 max-w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        )}
        <UserButton />
      </header>
    </div>
  );
};
