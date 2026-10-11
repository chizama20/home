import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

// The signed-in user's active orgs. Skipped while signed out (the query throws
// UNAUTHENTICATED), so `isLoading` stays true through sign-out.
export const useMyMemberships = () => {
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(api.orgs.myMemberships, isAuthenticated ? {} : "skip");
  const isLoading = data === undefined;

  return { data, isLoading };
};
