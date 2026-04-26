"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function AdminLogin() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const { toast } = useToast();

  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsAdminLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast({
        title: "Success",
        description: "Logged in successfully",
        variant: "success",
      });

      login(data.token, data.admin);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "error",
      });
    } finally {
      setIsAdminLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%)' }}>
      <header className="absolute top-0 right-0 p-6 z-10">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">DecodeTheTech</h1>
            <p className="text-[var(--text-muted)]">Admin Portal Access</p>
          </div>

          <Card className="glass animate-fade-in shadow-xl border-t-4 border-t-[var(--accent-primary)]">
            <CardHeader>
              <CardTitle>Admin Sign In</CardTitle>
              <CardDescription>Enter your credentials to manage your competitions.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@decodethetech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" fullWidth variant="primary" isLoading={isAdminLoading} className="mt-4">
                  Sign In to Dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Decorative background elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}
