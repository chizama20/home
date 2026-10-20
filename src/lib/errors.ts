import { ConvexError } from "convex/values";
import {
  ERROR_CODES,
  type AppErrorData,
  type ErrorCode,
} from "../../convex/lib/errors";

// Turns any thrown error into text that is safe and useful to show a person.
// Shared by every feature: org functions throw ConvexError({ code, message })
// (PLAN.md §5), while convex/auth.ts still throws ConvexError("plain string").

const GENERIC_MESSAGE = "Something went wrong. Try again.";

const CODE_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Your session has ended. Sign in again.",
  FORBIDDEN: "You don't have access to this.",
  ORG_INACTIVE: "This organization isn't active right now.",
  NOT_FOUND: "We couldn't find that. It may have been removed.",
  VALIDATION: "Check your entries and try again.",
  CONFLICT: "That conflicts with something that already exists.",
};

// Codes whose server message is written for the person using the app.
const USER_FACING_CODES: ReadonlySet<ErrorCode> = new Set([
  "VALIDATION",
  "CONFLICT",
]);

function isErrorCode(value: unknown): value is ErrorCode {
  return (ERROR_CODES as readonly unknown[]).includes(value);
}

function getAppError(err: unknown): AppErrorData | null {
  if (!(err instanceof ConvexError)) return null;
  const data: unknown = err.data;
  if (typeof data !== "object" || data === null) return null;
  const { code, message } = data as { code?: unknown; message?: unknown };
  if (!isErrorCode(code)) return null;
  return { code, message: typeof message === "string" ? message : "" };
}

export function getErrorCode(err: unknown): ErrorCode | null {
  return getAppError(err)?.code ?? null;
}

export function getErrorMessage(
  err: unknown,
  fallback: string = GENERIC_MESSAGE,
): string {
  const appError = getAppError(err);
  if (appError !== null) {
    if (USER_FACING_CODES.has(appError.code) && appError.message) {
      return appError.message;
    }
    return CODE_MESSAGES[appError.code];
  }
  // Plain-string ConvexErrors are deliberate, user-facing messages.
  if (err instanceof ConvexError && typeof err.data === "string" && err.data) {
    return err.data;
  }
  return fallback;
}
