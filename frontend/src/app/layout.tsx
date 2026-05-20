import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import AuthGuard from "@/components/AuthGuard";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "DClaw CRM",
  description: "DClaw vertical SaaS CRM application",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-[#F8F8FA] text-[#0F0F12]"
        style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
      >
        <AuthProvider>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
