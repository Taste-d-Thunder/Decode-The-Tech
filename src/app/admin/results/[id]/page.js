"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Badge } from "@/components/ui/Badge";

export default function ResultsAnalyticsPage() {
  const params = useParams();
  const id = params?.id;
  const { admin, loading } = useAuth();
  const router = useRouter();

  const [results, setResults] = useState([]);
  const [competition, setCompetition] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
      return;
    }
    
    if (admin && id) {
      // Mock fetch results analytics
      setTimeout(() => {
        setCompetition({ title: "Sample Web Dev Challenge", status: "ENDED" });
        setResults([
          { id: 't1', rank: 1, teamName: 'Code Ninjas', teamId: '20CS10', score: 95, roundsCompleted: 3, accuracy: "92%" },
          { id: 't2', rank: 2, teamName: 'Binary Bosses', teamId: '20CS11', score: 85, roundsCompleted: 3, accuracy: "80%" },
          { id: 't3', rank: 3, teamName: 'Debuggers', teamId: '20CS12', score: 60, roundsCompleted: 2, accuracy: "65%" },
        ]);
        setIsFetching(false);
      }, 800);
    }
  }, [admin, loading, id, router]);

  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    window.location.href = `/api/competitions/${id}/export?token=${token}`; // Simplified for demo
  };

  if (loading || isFetching) return <div className="flex-center min-h-screen">Loading analytics...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/admin/competition/${id}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              ← Competition
            </Link>
            <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
              Results Analytics
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleExport}>📥 Export CSV</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 animate-fade-in flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-muted)]">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-primary)]">80.0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-muted)]">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-primary)]">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-muted)]">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--text-primary)]">66%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg mt-4">
          <CardHeader>
            <CardTitle>Final Standings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]">
                  <TableHead className="w-16 font-bold text-center">Rank</TableHead>
                  <TableHead className="font-bold">Team Name</TableHead>
                  <TableHead className="font-bold text-center">Rounds Done</TableHead>
                  <TableHead className="font-bold text-center">Accuracy</TableHead>
                  <TableHead className="font-bold text-right">Final Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((team) => (
                  <TableRow key={team.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <TableCell className="text-center font-bold">
                      {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : team.rank}
                    </TableCell>
                    <TableCell className="font-semibold text-[var(--text-primary)]">{team.teamName}</TableCell>
                    <TableCell className="text-center">{team.roundsCompleted}</TableCell>
                    <TableCell className="text-center">{team.accuracy}</TableCell>
                    <TableCell className="text-right font-bold text-[var(--accent-primary)]">{team.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
