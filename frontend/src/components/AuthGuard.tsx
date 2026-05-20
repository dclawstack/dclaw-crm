"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (pathname === "/login" || pathname === "/") return;
    if (!user) router.replace("/login");
  }, [user, isLoading, pathname, router]);

  // Show nothing during the hydration tick — avoids flash of unauthenticated content
  if (isLoading) return null;
  // Let the login page render regardless
  if (pathname === "/login" || pathname === "/") return <>{children}</>;
  // Redirect in progress — render nothing
  if (!user) return null;

  return <>{children}</>;
}
