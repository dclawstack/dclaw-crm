"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalSearch from "@/components/GlobalSearch";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/deals", label: "Deals" },
  { href: "/activities", label: "Activities" },
  { href: "/tasks", label: "Tasks" },
  { href: "/settings/webhooks", label: "Webhooks" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname === "/" || pathname === "/login") return null;

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 border-b border-[#E8E8EC] bg-white shadow-[0_2px_6px_rgba(15,15,18,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link
          href="/"
          className="text-base font-bold text-[#7660A8] hover:text-[#5C4A8E] transition-colors"
        >
          DClaw CRM
        </Link>

        <div className="flex flex-1 items-center gap-1 text-sm">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all duration-[240ms] ${
                isActive(href)
                  ? "bg-[#F1EEF8] text-[#7660A8]"
                  : "text-[#404049] hover:bg-[#F1EEF8] hover:text-[#7660A8]"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <GlobalSearch />

        {user && (
          <div className="flex items-center gap-3 border-l border-[#E8E8EC] pl-4">
            <span className="max-w-[140px] truncate text-xs text-[#7A7A85]">{user.email}</span>
            <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs font-medium text-[#7660A8]">
              {user.role}
            </span>
            <button
              onClick={logout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#404049] transition-all duration-[240ms] hover:bg-[#FBE9E7] hover:text-[#B3261E]"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
