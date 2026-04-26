"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTeam } from "@/context/TeamContext";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/components/ui/Toast";

export default function LobbyPage() {
  const router = useRouter();
  const { team, loading } = useTeam();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  
  const [participantsCount, setParticipantsCount] = useState(1); // At least self

  useEffect(() => {
    if (loading) return;

    if (!team) {
      toast({
        title: "Session missing",
        description: "Please join the competition first",
        variant: "warning"
      });
      router.push("/");
      return;
    }

    if (team.status === 'ACTIVE') {
      router.push("/compete");
      return;
    }

    if (isConnected) {
      // Join the competition room via socket
      socket.emit("join-room", { competitionId: team.competitionId, teamId: team.id });
      // Notify admin
      socket.emit("team-joined", { competitionId: team.competitionId, team });

      // Listen for competition start
      socket.on("competition-start", () => {
        toast({
          title: "Competition Started!",
          description: "Get ready...",
          variant: "success",
          duration: 3000
        });
        
        // Brief delay for dramatic effect
        setTimeout(() => {
          router.push("/compete");
        }, 2000);
      });

      // Simulate receiving participant updates (in real app, server would track and broadcast this)
      socket.on("lobby-update", () => {
         // This would normally carry a count, we just increment for effect
         setParticipantsCount(prev => prev + 1);
      });
    }

    return () => {
      socket.off("competition-start");
      socket.off("lobby-update");
    };
  }, [team, loading, isConnected, socket, router, toast]);

  if (loading || !team) {
    return <div className="flex-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--bg-primary)]">
      <header className="absolute top-0 right-0 p-6 z-10">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 text-center">
        <h1 className="text-3xl font-bold gradient-text mb-8">DecodeTheTech</h1>

        <Card className="glass animate-slide-up shadow-xl w-full max-w-lg border-2 border-[var(--accent-primary)]">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center border-2 border-[var(--border-color)]">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Waiting Lobby</CardTitle>
            <CardDescription className="text-lg">
              Welcome, <strong className="text-[var(--text-primary)]">{team.teamName}</strong>!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-6">
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 relative overflow-hidden">
               {/* Pulsing background effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-10 animate-[pulse_2s_infinite]" style={{ backgroundSize: '200% 100%' }}></div>
               
               <p className="text-[var(--text-secondary)] font-medium z-10 relative">
                 Waiting for the admin to start the competition...
               </p>
            </div>

            <div className="flex justify-between items-center text-sm text-[var(--text-muted)] border-t border-[var(--border-color)] pt-4">
              <span>Connection: <span className={isConnected ? "text-[var(--success)]" : "text-[var(--warning)]"}>{isConnected ? "Online" : "Connecting..."}</span></span>
              <span>Team ID: {team.teamId}</span>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoOTksIDEwMiwgMjQxLCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>
    </div>
  );
}
