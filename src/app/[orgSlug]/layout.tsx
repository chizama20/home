import { AppShell } from "@/components/shell/app-shell";
import { AppShellSkeleton } from "@/components/shell/app-shell-skeleton";
import { CurrentOrgProvider } from "@/features/orgs/components/current-org-provider";

// Resolves the org once for every page under /[orgSlug]. Non-members are sent
// to "/" by the provider; pages read the org with useCurrentOrg().
export default async function OrgLayout({
  children,
  params,
}: LayoutProps<"/[orgSlug]">) {
  const { orgSlug } = await params;

  return (
    <CurrentOrgProvider slug={orgSlug} fallback={<AppShellSkeleton />}>
      <AppShell>{children}</AppShell>
    </CurrentOrgProvider>
  );
}
