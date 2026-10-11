import { ConvexError } from "convex/values";

// Error codes shared with the client error mapper (PLAN.md §5).
export const ERROR_CODES = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "ORG_INACTIVE",
  "NOT_FOUND",
  "VALIDATION",
  "CONFLICT",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type AppErrorData = { code: ErrorCode; message: string };

// Usage: `throw appError("CONFLICT", "That URL is taken")`.
export function appError(
  code: ErrorCode,
  message: string,
): ConvexError<AppErrorData> {
  return new ConvexError({ code, message });
}
