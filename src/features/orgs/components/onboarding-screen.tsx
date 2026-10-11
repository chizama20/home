"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/features/auth/components/user-button";
import { useMyMemberships } from "../api/use-my-memberships";
import { CreateOrgForm } from "./create-org-form";

export const OnboardingScreen = () => {
  const router = useRouter();
  const { data: memberships, isLoading } = useMyMemberships();
  const existingSlug = memberships?.[0]?.slug;

  // One org per person: anyone who already has one goes straight to it.
  useEffect(() => {
    if (existingSlug) router.replace(`/${existingSlug}`);
  }, [existingSlug, router]);

  const showForm = !isLoading && !existingSlug;

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex h-14 items-center justify-end border-b border-border bg-card px-4">
        <UserButton />
      </header>
      <main className="flex flex-1 justify-center px-4 py-8 sm:py-16">
        <div className="w-full max-w-md">
          <h1 className="text-xl font-semibold">Create your organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your company and all of its homes. You&apos;ll be the admin.
          </p>
          <div className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-6">
            {showForm ? <CreateOrgForm /> : <CreateOrgFormSkeleton />}
          </div>
        </div>
      </main>
    </div>
  );
};

const CreateOrgFormSkeleton = () => (
  <div className="space-y-5" aria-busy="true">
    <span role="status" className="sr-only">
      Loading
    </span>
    <div className="space-y-1.5">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-11 w-full" />
    </div>
    <div className="space-y-1.5">
      <Skeleton className="h-5 w-10" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-4 w-48" />
    </div>
    <Skeleton className="h-11 w-full" />
  </div>
);
