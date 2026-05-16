"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalSearch from "@/components/GlobalSearch";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/deals", label: "Deals" },
  { href: "/activities", label: "Activities" },
  { href: "/tasks", label: "Tasks" },
  { href: "/settings/webhooks", label: "Webhooks" },
];

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-40 border-b border-[#E8E8EC] bg-white shadow-[0_2px_6px_rgba(15,15,18,0.06)]">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-base font-bold text-[#7660A8] hover:text-[#5C4A8E] transition-colors">
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
      </div>
    </nav>
  );
}
