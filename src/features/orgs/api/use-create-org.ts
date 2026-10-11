import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

type CreateOrgArgs = { name: string; slug: string };

// Creates an org with the caller as admin. Resolves to the saved slug and
// rethrows server errors for the caller to map.
export const useCreateOrg = () => {
  const mutation = useMutation(api.orgs.create);
  const [isPending, setIsPending] = useState(false);

  const createOrg = useCallback(
    async (args: CreateOrgArgs) => {
      setIsPending(true);
      try {
        return await mutation(args);
      } finally {
        setIsPending(false);
      }
    },
    [mutation],
  );

  return { createOrg, isPending };
};
