"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTeam } from "@/context/TeamContext";
import { useToast } from "@/components/ui/Toast";

export default function JoinPage() {
  const router = useRouter();
  const { joinTeam, loading } = useTeam();
  const { toast } = useToast();

  const [isJoinLoading, setIsJoinLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState("");

  const handleJoinCompetition = async (e) => {
    e.preventDefault();
    setIsJoinLoading(true);

    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode, teamName, teamId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to join");
      }

      toast({
        title: "Success",
        description: "Joined competition successfully",
        variant: "success",
      });

      joinTeam({
        ...data.team,
        sessionToken: data.sessionToken,
      });
      
      router.push("/lobby");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "error",
      });
    } finally {
      setIsJoinLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%)' }}>
      <header className="absolute top-0 right-0 p-6 z-10">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">DecodeTheTech</h1>
            <p className="text-[var(--text-muted)]">Join your competition</p>
          </div>

          <Card className="glass animate-fade-in shadow-xl">
            <CardHeader>
              <CardTitle>Join as Participant</CardTitle>
              <CardDescription>Enter your team details and the competition code to join.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinCompetition} className="space-y-4">
                <div>
                  <Label htmlFor="joinCode">Competition Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="e.g. WEBDEV"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g. Code Ninjas"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teamId">Team ID / Roll No</Label>
                  <Input
                    id="teamId"
                    placeholder="e.g. 20CS1001"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" fullWidth isLoading={isJoinLoading} className="mt-2">
                  Join Lobby
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Decorative background elements */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[var(--accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[var(--accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}
