import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw CRM",
  description: "DClaw vertical SaaS application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold text-slate-800">
              DClaw CRM
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/customers" className="text-slate-600 hover:text-slate-900">
                Customers
              </Link>
              <Link href="/deals" className="text-slate-600 hover:text-slate-900">
                Deals
              </Link>
              <Link href="/activities" className="text-slate-600 hover:text-slate-900">
                Activities
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
