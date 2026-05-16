import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw CRM",
  description: "DClaw vertical SaaS CRM application",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F8FA] text-[#0F0F12]" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
        <AuthGuard>
          <NavBar />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}
