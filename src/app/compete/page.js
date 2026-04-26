"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";
import { useTeam } from "@/context/TeamContext";
import { useSocket } from "@/context/SocketContext";
import { QuestionRenderer } from "@/components/compete/QuestionRenderer";
import { RoundProgress } from "@/components/compete/RoundProgress";

export default function CompetePage() {
  const router = useRouter();
  const { team, loading: teamLoading, joinTeam } = useTeam();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();

  const [competition, setCompetition] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Fetch competition and round data
  const loadRoundData = useCallback(async () => {
    if (!team) return;
    
    setIsFetching(true);
    try {
      // Assuming we have a public or team-specific endpoint to get active round data
      // For this demo, let's use the socket to get the state or a dedicated API.
      // We will mock the API call logic here assuming an API exists to fetch current round for the team.
      
      const res = await fetch(`/api/teams/current-round?sessionToken=${team.sessionToken}`);
      
      if (!res.ok) {
         if (res.status === 404 || res.status === 403) {
           toast({ title: "Competition Ended", description: "You have completed all rounds or competition ended.", variant: "info" });
           router.push("/results");
           return;
         }
         throw new Error("Failed to load round");
      }
      
      const data = await res.json();
      setCompetition(data.competition);
      setCurrentRound(data.round);
      setQuestions(data.questions);
      
      // Calculate remaining time based on round start
      setRemainingTime(data.round.timeLimitSeconds); // In real app, calculate diff from server time

    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "error" });
    } finally {
      setIsFetching(false);
    }
  }, [team, router, toast]);

  // Temporary mock since we don't have the current-round API yet
  useEffect(() => {
    if (teamLoading) return;
    if (!team) {
      router.push("/");
      return;
    }

    // Mock data for UI development
    setCompetition({ title: "Sample Web Dev Challenge" });
    setCurrentRound({ id: "r1", title: "Round 1: HTML & CSS Basics", timeLimitSeconds: 600, allowBackNavigation: true });
    setQuestions([
      { id: "q1", type: "MCQ", text: "What does HTML stand for?", options: JSON.stringify(["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"]), marks: 10, negativeMarks: 0 },
      { id: "q2", type: "TRUE_FALSE", text: "CSS stands for Cascading Style Sheets.", marks: 5, negativeMarks: 2 },
      { id: "q3", type: "SHORT_ANSWER", text: "Which property is used to change the background color?", marks: 15, negativeMarks: 5 }
    ]);
    setRemainingTime(600);
    setIsFetching(false);

    // Socket listeners
    if (isConnected) {
      socket.emit("join-room", { competitionId: team.competitionId, teamId: team.id });
      
      socket.on("competition-pause", () => {
         toast({ title: "Paused", description: "Competition has been paused by admin", variant: "warning" });
      });

      socket.on("competition-end", () => {
         handleSubmit(true); // Auto submit
         toast({ title: "Ended", description: "Competition has ended", variant: "info" });
         router.push("/results"); // Assuming a results view
      });
    }

    return () => {
      socket.off("competition-pause");
      socket.off("competition-end");
    };
  }, [team, teamLoading, isConnected, socket, router, toast]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/teams/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: team.sessionToken,
          roundId: currentRound.id,
          answers,
          isAutoSubmitted: isAuto
        })
      });

      const data = await res.json();

      if (!res.ok && res.status !== 409) { // 409 is already submitted
        throw new Error(data.error || "Submission failed");
      }

      toast({
        title: isAuto ? "Time's up!" : "Submitted!",
        description: "Your answers have been recorded.",
        variant: "success"
      });

      // Update team session with new round index
      joinTeam({ ...team, currentRoundIndex: team.currentRoundIndex + 1 });

      // In real flow, we might wait for socket event to unlock next round
      // For now, reload data to get next round
      // loadRoundData();
      
      // Mock progression
      toast({ title: "Waiting", description: "Waiting for next round to unlock...", variant: "info" });
      setTimeout(() => router.push("/lobby"), 2000);

    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "error" });
      setIsSubmitting(false);
    }
  };

  if (teamLoading || isFetching) {
    return <div className="flex-center min-h-screen">Loading competition data...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="text-xl font-bold gradient-text">{competition?.title}</span>
            <span className="text-sm text-[var(--text-muted)]">{currentRound?.title}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Timer 
              initialSeconds={remainingTime} 
              onTimeout={() => handleSubmit(true)} 
              className="text-lg py-1 px-4"
            />
            <div className="hidden sm:block">
              <span className="text-sm font-medium mr-2">Team:</span>
              <span className="text-sm bg-[var(--bg-tertiary)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                {team?.teamName}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 w-full max-w-4xl mx-auto gap-8">
        
        {/* Progress */}
        <div className="w-full flex justify-center mt-4">
          <RoundProgress current={currentQuestionIndex + 1} total={questions.length} />
        </div>

        {/* Question Area */}
        <div className="w-full bg-[var(--bg-secondary)] rounded-xl shadow-md border border-[var(--border-color)] p-8 min-h-[400px]">
          <QuestionRenderer 
            question={currentQuestion} 
            index={currentQuestionIndex}
            answer={answers[currentQuestion?.id]}
            onAnswerChange={handleAnswerChange}
          />
        </div>

        {/* Navigation Controls */}
        <div className="w-full flex justify-between items-center mt-4 pb-12">
          <div>
            {currentRound?.allowBackNavigation && currentQuestionIndex > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                ← Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-4">
            {!isLastQuestion ? (
              <Button variant="primary" onClick={handleNext}>
                Next Question →
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => handleSubmit(false)}
                isLoading={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white border-none shadow-lg"
              >
                Submit Round
              </Button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
