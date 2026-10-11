// Shared by the Password provider (server) and the sign-up form (client),
// so the checklist users see always matches what the server enforces.
export const passwordRequirements = [
  { label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { label: "One uppercase letter", test: (password: string) => /[A-Z]/.test(password) },
  { label: "One lowercase letter", test: (password: string) => /[a-z]/.test(password) },
  { label: "One number", test: (password: string) => /[0-9]/.test(password) },
];

export const meetsPasswordRequirements = (password: string) =>
  passwordRequirements.every((requirement) => requirement.test(password));
