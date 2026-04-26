"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";

export default function LeaderboardPage() {
  const params = useParams();
  const id = params?.id;
  const { admin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();

  const [leaderboard, setLeaderboard] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // Mock fetching leaderboard
  const fetchLeaderboard = async () => {
    try {
      // In a real app, fetch from `/api/competitions/${id}/leaderboard`
      // Mocking response for demo
      setTimeout(() => {
        setLeaderboard([
          { id: 't1', rank: 1, teamName: 'Code Ninjas', teamId: '20CS10', score: 95, time: '12m 34s', status: 'FINISHED' },
          { id: 't2', rank: 2, teamName: 'Binary Bosses', teamId: '20CS11', score: 85, time: '14m 10s', status: 'ACTIVE' },
          { id: 't3', rank: 3, teamName: 'Debuggers', teamId: '20CS12', score: 60, time: '15m 00s', status: 'ACTIVE' },
        ]);
        setIsFetching(false);
      }, 500);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load leaderboard", variant: "error" });
    }
  };

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
      return;
    }
    if (admin && id) {
      fetchLeaderboard();
    }
  }, [admin, loading, id, router]);

  useEffect(() => {
    if (isConnected && id) {
      socket.emit("admin-join", id);
      
      socket.on("leaderboard-update", () => {
        // Fetch new data
        toast({ title: "Leaderboard Updated", description: "New scores arrived", variant: "info", duration: 2000 });
        // fetchLeaderboard();
      });
    }
    return () => {
      socket.off("leaderboard-update");
    };
  }, [isConnected, id, socket, toast]);

  if (loading || isFetching) {
    return <div className="flex-center min-h-screen">Loading leaderboard...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/admin/competition/${id}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              ← Competition
            </Link>
            <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
              Live Leaderboard
              <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Export CSV</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 animate-fade-in">
        <Card className="shadow-lg border-t-4 border-t-[var(--accent-secondary)]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]">
                  <TableHead className="w-16 font-bold text-center">Rank</TableHead>
                  <TableHead className="font-bold">Team Name</TableHead>
                  <TableHead className="font-bold">Team ID</TableHead>
                  <TableHead className="font-bold text-right">Total Score</TableHead>
                  <TableHead className="font-bold text-right">Time Taken</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[var(--text-muted)]">
                      No data available yet. Waiting for submissions...
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((team) => (
                    <TableRow key={team.id} className="cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                      <TableCell className="text-center font-bold text-lg">
                        {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                      </TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">{team.teamName}</TableCell>
                      <TableCell className="font-mono text-sm">{team.teamId}</TableCell>
                      <TableCell className="text-right font-bold text-[var(--accent-primary)]">{team.score}</TableCell>
                      <TableCell className="text-right text-[var(--text-secondary)]">{team.time}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={team.status === 'FINISHED' ? 'success' : 'warning'}>
                          {team.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
