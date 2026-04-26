"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";

export default function NewCompetition() {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
    }
  }, [admin, loading, router]);

  if (loading || !admin) return null;

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch("/api/competitions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, rules, isDraft })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create competition");

      toast({
        title: "Success",
        description: `Competition ${isDraft ? 'draft saved' : 'created'} successfully!`,
        variant: "success"
      });

      router.push(`/admin/competition/${data.competition.id}`);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "error" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              ← Back
            </Link>
            <h1 className="text-xl font-bold gradient-text">Create Competition</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6 lg:p-8 animate-fade-in">
        <Card className="shadow-lg border-t-4 border-t-[var(--accent-primary)]">
          <CardHeader>
            <CardTitle className="text-2xl">Competition Details</CardTitle>
            <CardDescription>
              Basic information about your event. A unique join code will be generated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Competition Title <span className="text-[var(--danger)]">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g. HackSprint 2024"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full rounded-md border border-[var(--border-color)] bg-transparent p-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all resize-y"
                  placeholder="Briefly describe what this competition is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rules">Rules & Guidelines</Label>
                <textarea
                  id="rules"
                  rows={6}
                  className="w-full rounded-md border border-[var(--border-color)] bg-transparent p-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all resize-y font-mono"
                  placeholder="- No mobile phones allowed&#10;- Negative marking applies&#10;- Use of AI tools is restricted"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  maxLength={2000}
                />
              </div>

              <div className="pt-6 border-t border-[var(--border-color)] flex gap-4 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={(e) => handleSubmit(e, false)}
                  isLoading={isSubmitting}
                >
                  Create & Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
