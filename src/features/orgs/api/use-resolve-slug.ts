import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// The org behind a URL slug, or null when it doesn't exist or the user isn't
// an active member. Skipped while signed out, so `isLoading` stays true
// through sign-out instead of throwing UNAUTHENTICATED.
export const useResolveSlug = (slug: string) => {
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(
    api.orgs.resolveSlug,
    isAuthenticated ? { slug } : "skip",
  );
  const isLoading = data === undefined;

  return { data, isLoading };
};
