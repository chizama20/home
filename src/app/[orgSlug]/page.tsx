import { redirect } from "next/navigation";

import { orgPath } from "@/features/orgs/sections";

// Dash is the landing page for every role.
export default async function OrgPage({ params }: PageProps<"/[orgSlug]">) {
  const { orgSlug } = await params;
  redirect(orgPath(orgSlug));
}
