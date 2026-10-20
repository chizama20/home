"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { orgPath } from "../sections";
import { useCurrentOrg } from "./current-org-provider";

// Sends staff who open an admin page (e.g. by typing the URL) back to Dash.
// This only tidies the UI; the server checks the role on every admin function.
export const AdminOnly = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { role, slug } = useCurrentOrg();
  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isAdmin) router.replace(orgPath(slug));
  }, [isAdmin, router, slug]);

  return isAdmin ? children : null;
};
