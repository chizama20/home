import { OrgHomeScreen } from "@/features/orgs/components/org-home-screen";

export default async function OrgPage({ params }: PageProps<"/[orgSlug]">) {
  const { orgSlug } = await params;
  return <OrgHomeScreen slug={orgSlug} />;
}
