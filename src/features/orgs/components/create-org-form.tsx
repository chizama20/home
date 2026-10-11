"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorCode, getErrorMessage } from "@/lib/errors";
import {
  ORG_NAME_MAX,
  SLUG_MAX,
  normalizeSlug,
  slugify,
  validateOrgName,
  validateSlug,
} from "../../../../convex/lib/slug";
import { useCreateOrg } from "../api/use-create-org";

type ServerError = { field: "name" | "slug" | "form"; message: string };

const subscribeToNothing = () => () => {};
const getHost = () => window.location.host;
const getServerHost = () => "";

// Server VALIDATION and CONFLICT messages name the field they're about
// ("Organization name must…", "That URL is already taken"). Anything else,
// like "You already belong to an organization", belongs to the whole form.
function toServerError(err: unknown): ServerError {
  const message = getErrorMessage(err, "Could not create the organization. Try again.");
  const code = getErrorCode(err);
  if (code === "VALIDATION" || code === "CONFLICT") {
    if (message.startsWith("Organization name")) return { field: "name", message };
    if (message.includes("URL")) return { field: "slug", message };
  }
  return { field: "form", message };
}

export const CreateOrgForm = () => {
  const router = useRouter();
  const { createOrg, isPending } = useCreateOrg();
  const host = useSyncExternalStore(subscribeToNothing, getHost, getServerHost);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);

  const disabled = isPending || succeeded;
  const normalizedSlug = normalizeSlug(slug);
  const nameError = validateOrgName(name.trim());
  const slugError = validateSlug(normalizedSlug);

  // Hold client errors until the person has had a chance to finish typing.
  const showNameError = nameTouched || submitted;
  const showSlugError = slugTouched || submitted || (nameTouched && !slugEdited);

  const nameMessage =
    (showNameError ? nameError : null) ??
    (serverError?.field === "name" ? serverError.message : null);
  const slugMessage =
    (showSlugError ? slugError : null) ??
    (serverError?.field === "slug" ? serverError.message : null);
  const formMessage = serverError?.field === "form" ? serverError.message : null;

  // Focus after the inputs re-enable, not inside the rejected promise.
  useEffect(() => {
    if (serverError?.field === "name") nameRef.current?.focus();
    if (serverError?.field === "slug") slugRef.current?.focus();
  }, [serverError]);

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
    if (serverError?.field !== "form") setServerError(null);
  };

  const onSlugChange = (value: string) => {
    setSlug(normalizeSlug(value));
    setSlugEdited(true);
    if (serverError?.field !== "form") setServerError(null);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    if (nameError !== null) {
      nameRef.current?.focus();
      return;
    }
    if (slugError !== null) {
      slugRef.current?.focus();
      return;
    }

    createOrg({ name: name.trim(), slug: normalizedSlug })
      .then((savedSlug) => {
        setSucceeded(true);
        router.replace(`/${savedSlug}`);
      })
      .catch((err: unknown) => setServerError(toServerError(err)));
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      {formMessage && (
        <div
          role="alert"
          className="flex items-center gap-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          <TriangleAlertIcon className="size-4 shrink-0" />
          <p>{formMessage}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="org-name" className="text-sm font-medium">
          Organization name
        </label>
        <Input
          ref={nameRef}
          id="org-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => setNameTouched(true)}
          disabled={disabled}
          placeholder="Precious AFC"
          autoComplete="organization"
          maxLength={ORG_NAME_MAX}
          aria-invalid={nameMessage !== null}
          aria-describedby={nameMessage ? "org-name-error" : undefined}
          className="h-11"
          autoFocus
        />
        {nameMessage && (
          <p id="org-name-error" className="text-xs text-destructive">
            {nameMessage}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="org-slug" className="text-sm font-medium">
          URL
        </label>
        <Input
          ref={slugRef}
          id="org-slug"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          onBlur={() => setSlugTouched(true)}
          disabled={disabled}
          placeholder="precious-afc"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={SLUG_MAX}
          aria-invalid={slugMessage !== null}
          aria-describedby={
            slugMessage ? "org-slug-error org-slug-preview" : "org-slug-preview"
          }
          className="h-11"
        />
        {slugMessage && (
          <p id="org-slug-error" className="text-xs text-destructive">
            {slugMessage}
          </p>
        )}
        <p id="org-slug-preview" className="text-xs break-all text-muted-foreground">
          {host}/<span className="text-foreground">{normalizedSlug || "your-org"}</span>
        </p>
      </div>

      <Button type="submit" size="lg" className="h-11 w-full" disabled={disabled}>
        {disabled ? "Creating…" : "Create organization"}
      </Button>
    </form>
  );
};
