"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users away from login
  useEffect(() => {
    if (isAuthenticated()) router.replace("/");
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await loginUser(email, password);
      saveAuth(resp.access_token, resp.user);
      router.push("/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-sm rounded-2xl border-[#E8E8EC] shadow-[0_8px_20px_rgba(15,15,18,0.08)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-[#0F0F12]">Sign in to DClaw CRM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wide text-[#7A7A85]">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1 rounded-xl border-[#E8E8EC] focus:border-[#C9C0DE]"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wide text-[#7A7A85]">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 rounded-xl border-[#E8E8EC] focus:border-[#C9C0DE]"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          {error && <p className="text-sm text-[#B3261E]">{error}</p>}
          <Button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E] transition-all duration-[240ms]"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
