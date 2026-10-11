"use client";

import { UserButton } from "@/features/auth/components/user-button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <p className="text-2xl text-white">Welcome to your new app!</p>
      <UserButton />
    </div>
  );
}
