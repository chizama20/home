"use client";

import { TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 justify-center px-4 py-16">
      <div role="alert" className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-x-2 text-destructive">
          <TriangleAlertIcon className="size-5 shrink-0" />
          <h1 className="text-xl font-semibold">This page couldn&apos;t load</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {getErrorMessage(error, "Something went wrong on our end. Try again.")}
        </p>
        <Button size="lg" className="h-11" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
