"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { formatTime } from "@/lib/utils";

export default function CompetitionDetail() {
  const params = useParams();
  const id = params?.id;
  const { admin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();

  const [competition, setCompetition] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchCompetition = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/competitions/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch competition");

      const data = await res.json();
      setCompetition(data.competition);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "error" });
    } finally {
      setIsFetching(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
      return;
    }
    if (admin && id) {
      fetchCompetition();
    }
  }, [admin, loading, id, router, fetchCompetition]);

  useEffect(() => {
    if (isConnected && competition) {
      socket.emit("admin-join", competition.id);
      
      socket.on("team-joined", (team) => {
        toast({ title: "New Team", description: `${team.teamName} joined!`, variant: "info" });
        // Refresh to get updated team count
        fetchCompetition();
      });
    }
    return () => {
      socket.off("team-joined");
    };
  }, [isConnected, competition, socket, toast, fetchCompetition]);

  const handleStatusChange = async (newStatus) => {
    setIsActionLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`/api/competitions/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      await fetchCompetition();
      toast({ title: "Status Updated", description: `Competition is now ${newStatus}`, variant: "success" });

      // Emit socket event for clients
      if (isConnected) {
        if (newStatus === 'ACTIVE') socket.emit("competition-start", id);
        if (newStatus === 'PAUSED') socket.emit("competition-pause", id);
        if (newStatus === 'ENDED') socket.emit("competition-end", id);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "error" });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading || isFetching) {
    return <div className="flex-center min-h-screen">Loading competition details...</div>;
  }

  if (!competition) return <div className="flex-center min-h-screen">Competition not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold gradient-text line-clamp-1">{competition.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            {competition.status === 'ACTIVE' && (
              <Link href={`/admin/competition/${id}/leaderboard`}>
                <Button variant="outline" size="sm" className="border-[var(--success)] text-[var(--success)] hover:bg-[rgba(16,185,129,0.1)] animate-pulse">
                  Live Leaderboard
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
        
        {/* Top controls & info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-1">{competition.title}</CardTitle>
                  <CardDescription>Join Code: <span className="font-mono text-[var(--text-primary)] font-bold">{competition.joinCode}</span></CardDescription>
                </div>
                <Badge variant={competition.status === 'ACTIVE' ? 'success' : 'default'} className="text-sm px-3 py-1">
                  {competition.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{competition.description}</p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                {competition.status === 'DRAFT' && (
                  <Button variant="primary" onClick={() => handleStatusChange('WAITING')} isLoading={isActionLoading}>
                    Publish (Open Lobby)
                  </Button>
                )}
                {competition.status === 'WAITING' && (
                  <Button variant="success" onClick={() => handleStatusChange('ACTIVE')} isLoading={isActionLoading} className="bg-green-600 hover:bg-green-700 text-white">
                    ▶ Start Competition
                  </Button>
                )}
                {competition.status === 'ACTIVE' && (
                  <>
                    <Button variant="warning" onClick={() => handleStatusChange('PAUSED')} isLoading={isActionLoading}>
                      ⏸ Pause
                    </Button>
                    <Button variant="danger" onClick={() => handleStatusChange('ENDED')} isLoading={isActionLoading}>
                      ⏹ End Competition
                    </Button>
                  </>
                )}
                {competition.status === 'PAUSED' && (
                  <Button variant="success" onClick={() => handleStatusChange('ACTIVE')} isLoading={isActionLoading}>
                    ▶ Resume
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <span className="text-[var(--text-muted)]">Teams Joined</span>
                <span className="text-xl font-bold">{competition._count?.teams || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                <span className="text-[var(--text-muted)]">Total Rounds</span>
                <span className="text-xl font-bold">{competition.rounds?.length || 0}</span>
              </div>
              {competition.startedAt && (
                <div className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <span className="text-[var(--text-muted)]">Started</span>
                  <span className="text-sm font-medium">{new Date(competition.startedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rounds Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Competition Rounds</CardTitle>
              <CardDescription>Manage the sequence of rounds.</CardDescription>
            </div>
            {(competition.status === 'DRAFT' || competition.status === 'WAITING') && (
              <Button variant="outline" size="sm">Add Round</Button> // Will hook up to modal later
            )}
          </CardHeader>
          <CardContent>
            {competition.rounds?.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)]">
                No rounds created yet. Add a round to start building questions.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competition.rounds.map((round, idx) => (
                    <TableRow key={round.id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>{round.title}</TableCell>
                      <TableCell>{formatTime(round.timeLimitSeconds)}</TableCell>
                      <TableCell>{round._count?.questions || 0}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/competition/${id}/questions?roundId=${round.id}`}>
                          <Button variant="ghost" size="sm">Manage Questions →</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
