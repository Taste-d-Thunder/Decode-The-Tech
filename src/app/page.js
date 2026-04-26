"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useTeam } from "@/context/TeamContext";
import { useToast } from "@/components/ui/Toast";
import styles from "./page.module.css";

export default function LandingPage() {
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
  const { joinTeam, loading: teamLoading } = useTeam();
  const { toast } = useToast();

  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isJoinLoading, setIsJoinLoading] = useState(false);

  // Admin Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Participant Form State
  const [joinCode, setJoinCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState("");

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

  if (authLoading || teamLoading) {
    return <div className="flex-center min-h-screen">Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className="gradient-text font-bold text-2xl">DecodeTheTech</span>
        </div>
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            The Ultimate <span className="gradient-text">Tech Competition</span> Platform
          </h1>
          <p className={styles.subtitle}>
            Host automated, multi-round technical assessments with real-time leaderboards.
          </p>
        </div>

        <div className={styles.authContainer}>
          <Tabs defaultValue="participant" className="w-full">
            <TabsList>
              <TabsTrigger value="participant">Join Competition</TabsTrigger>
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
            </TabsList>

            <TabsContent value="participant">
              <Card className="glass animate-fade-in">
                <CardHeader>
                  <CardTitle>Join as Participant</CardTitle>
                  <CardDescription>Enter your team details and the competition code to join.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoinCompetition} className={styles.form}>
                    <div className="space-y-4">
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
                      <Button type="submit" fullWidth isLoading={isJoinLoading}>
                        Join Lobby
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card className="glass animate-fade-in">
                <CardHeader>
                  <CardTitle>Admin Portal</CardTitle>
                  <CardDescription>Sign in to manage your competitions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAdminLogin} className={styles.form}>
                    <div className="space-y-4">
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
                      <Button type="submit" fullWidth variant="primary" isLoading={isAdminLoading}>
                        Sign In
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⏱️</div>
            <h3>Real-time Sync</h3>
            <p>Live timers, instant unlocking of rounds, and real-time leaderboards via WebSockets.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>Auto Evaluation</h3>
            <p>Instant scoring for MCQs, Match the Column, and True/False questions.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Analytics</h3>
            <p>Export results, view detailed performance metrics, and track completion times.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Decode The Tech. All rights reserved.</p>
      </footer>
    </div>
  );
}
