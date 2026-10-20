"use client";

import { createContext, use, useEffect, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { FunctionReturnType } from "convex/server";

import type { api } from "../../../../convex/_generated/api";
import { useResolveSlug } from "../api/use-resolve-slug";

export type CurrentOrg = NonNullable<
  FunctionReturnType<typeof api.orgs.resolveSlug>
> & { slug: string };

const CurrentOrgContext = createContext<CurrentOrg | null>(null);

interface CurrentOrgProviderProps {
  slug: string;
  // Shown while the org loads, while signing out, and while redirecting away.
  fallback: ReactNode;
  children: ReactNode;
}

// Resolves the org behind the URL once for everything under /[orgSlug].
// Children only render for an active member, so they can rely on
// useCurrentOrg() returning an org.
export const CurrentOrgProvider = ({
  slug,
  fallback,
  children,
}: CurrentOrgProviderProps) => {
  const router = useRouter();
  const { data } = useResolveSlug(slug);

  // Not a member, no such org, or a non-canonical URL: same answer for all.
  useEffect(() => {
    if (data === null) router.replace("/");
  }, [data, router]);

  const org = useMemo<CurrentOrg | null>(
    () => (data ? { ...data, slug } : null),
    [data, slug],
  );

  if (org === null) return fallback;

  return <CurrentOrgContext value={org}>{children}</CurrentOrgContext>;
};

export const useCurrentOrg = (): CurrentOrg => {
  const org = use(CurrentOrgContext);
  if (org === null) {
    throw new Error("useCurrentOrg must be used inside <CurrentOrgProvider>");
  }
  return org;
};
