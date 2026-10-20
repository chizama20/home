"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Light (default), dark or system, stored per device in localStorage. next-themes injects
// a blocking script that sets `.dark` on <html> before first paint.
//
// The script only needs to run in the server HTML. On the client it is marked
// text/plain so React 19 doesn't warn about rendering a <script>.
const scriptProps = {
  type: typeof window === "undefined" ? "text/javascript" : "text/plain",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
