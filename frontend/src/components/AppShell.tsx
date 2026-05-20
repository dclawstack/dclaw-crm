"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </>
  );
}
