"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMyMemberships } from "../api/use-my-memberships";
import { orgPath } from "../sections";

// Sends the signed-in user to their org, or to onboarding if they have none.
// The org picker for people in several orgs arrives in Step 4.
export const OrgRedirect = () => {
  const router = useRouter();
  const { data: memberships } = useMyMemberships();

  useEffect(() => {
    if (memberships === undefined) return;
    const first = memberships[0];
    router.replace(first ? orgPath(first.slug) : "/onboarding");
  }, [memberships, router]);

  // The destination is unknown until the query returns, so render nothing
  // visible rather than a skeleton of the wrong page.
  return (
    <span role="status" className="sr-only">
      Loading
    </span>
  );
};
