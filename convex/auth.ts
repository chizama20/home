import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";
import { meetsPasswordRequirements } from "./passwordRequirements";

const MAX_NAME_LENGTH = 50;

const requireName = (value: unknown, label: string) => {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) {
    throw new ConvexError(`${label} is required`);
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new ConvexError(`${label} must be ${MAX_NAME_LENGTH} characters or fewer`);
  }
  return name;
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      profile(googleProfile) {
        return {
          id: googleProfile.sub,
          name: googleProfile.name,
          firstName: googleProfile.given_name,
          lastName: googleProfile.family_name,
          email: googleProfile.email,
          image: googleProfile.picture,
        };
      },
    }),
    Password({
      validatePasswordRequirements: (password) => {
        if (!meetsPasswordRequirements(password)) {
          throw new ConvexError("Password does not meet the requirements");
        }
      },
      profile(params): { email: string } & Record<string, string> {
        const email = params.email as string;

        // Names are only sent when creating an account.
        if (params.flow !== "signUp") {
          return { email };
        }

        const firstName = requireName(params.firstName, "First name");
        const lastName = requireName(params.lastName, "Last name");

        return {
          email,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
        };
      },
    }),
  ],
});
