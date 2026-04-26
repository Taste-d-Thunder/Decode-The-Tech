"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";

export default function AdminDashboard() {
  const { admin, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [competitions, setCompetitions] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!admin) {
      router.push("/admin/login");
      return;
    }

    const fetchCompetitions = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch("/api/competitions", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch competitions");

        const data = await res.json();
        setCompetitions(data.competitions);
      } catch (error) {
        toast({ title: "Error", description: error.message, variant: "error" });
      } finally {
        setIsFetching(false);
      }
    };

    fetchCompetitions();
  }, [admin, loading, router, toast]);

  if (loading || isFetching) {
    return <div className="flex-center min-h-screen">Loading dashboard...</div>;
  }

  if (!admin) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'default';
      case 'WAITING': return 'warning';
      case 'ENDED': return 'secondary';
      case 'ARCHIVED': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold gradient-text">DecodeTheTech Admin</h1>
            <Badge variant="outline" className="hidden sm:inline-flex">{admin.name}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={logout} size="sm">Logout</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8">
        <div className="flex justify-between items-end mb-8 border-b border-[var(--border-color)] pb-4">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Competitions</h2>
            <p className="text-[var(--text-muted)] mt-1">Manage your events, questions, and view live results.</p>
          </div>
          <Link href="/admin/competition/new">
            <Button variant="primary">
              <span className="mr-2">+</span> Create New
            </Button>
          </Link>
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-color)]">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">No competitions yet</h3>
            <p className="text-[var(--text-muted)] mb-6">Create your first competition to get started.</p>
            <Link href="/admin/competition/new">
              <Button>Create Competition</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {competitions.map((comp) => (
              <Card key={comp.id} className="flex flex-col hover:border-[var(--accent-primary)] transition-colors">
                <CardHeader className="pb-3 border-b border-[var(--border-color)]">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getStatusColor(comp.status)}>{comp.status}</Badge>
                    <span className="text-xs font-mono bg-[var(--bg-tertiary)] px-2 py-1 rounded">
                      Code: {comp.joinCode}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-1" title={comp.title}>{comp.title}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {comp.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <div className="flex gap-4 text-sm text-[var(--text-muted)]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text-primary)]">{comp._count?.rounds || 0}</span>
                      <span>Rounds</span>
                    </div>
                    <div className="w-px bg-[var(--border-color)]"></div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--text-primary)]">{comp._count?.teams || 0}</span>
                      <span>Teams</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-[var(--border-color)] mt-auto flex gap-2 p-4">
                  <Link href={`/admin/competition/${comp.id}`} className="flex-1">
                    <Button variant="secondary" fullWidth size="sm">Manage</Button>
                  </Link>
                  {comp.status === 'ACTIVE' && (
                    <Link href={`/admin/competition/${comp.id}/leaderboard`} className="flex-1">
                      <Button variant="outline" fullWidth size="sm" className="border-[var(--success)] text-[var(--success)] hover:bg-[rgba(16,185,129,0.1)]">
                        Live 🔴
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
