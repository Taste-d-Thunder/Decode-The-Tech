"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useToast } from "@/components/ui/Toast";

export default function QuestionsBuilderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const initialRoundId = searchParams?.get('roundId');
  
  const { admin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [competition, setCompetition] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(initialRoundId || "");
  const [isFetching, setIsFetching] = useState(true);
  
  // Question Form State
  const [qType, setQType] = useState("MCQ");
  const [qText, setQText] = useState("");
  const [qMarks, setQMarks] = useState(1);
  const [qNegMarks, setQNegMarks] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      router.push("/admin/login");
      return;
    }
    if (admin && id) {
      const fetchCompetition = async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const res = await fetch(`/api/competitions/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setCompetition(data.competition);
          
          if (!selectedRoundId && data.competition.rounds?.length > 0) {
            setSelectedRoundId(data.competition.rounds[0].id);
          }
        } catch (error) {
          toast({ title: "Error", description: error.message, variant: "error" });
        } finally {
          setIsFetching(false);
        }
      };
      fetchCompetition();
    }
  }, [admin, loading, id, router, selectedRoundId, toast]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedRoundId) {
      toast({ title: "Error", description: "Please select or create a round first", variant: "warning" });
      return;
    }
    if (!qText.trim()) {
      toast({ title: "Error", description: "Question text is required", variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      // In a real app, collect options and correctAnswer based on qType
      const mockOptions = qType === 'MCQ' ? ["Option A", "Option B", "Option C", "Option D"] : null;
      const mockCorrect = qType === 'MCQ' ? ["Option A"] : (qType === 'TRUE_FALSE' ? ["True"] : []);

      const res = await fetch(`/api/competitions/${id}/questions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          roundId: selectedRoundId,
          type: qType,
          text: qText,
          options: mockOptions,
          correctAnswer: mockCorrect,
          marks: qMarks,
          negativeMarks: qNegMarks,
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add question");
      }

      toast({ title: "Success", description: "Question added successfully", variant: "success" });
      setQText("");
      // Ideally, refresh round questions list here
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isFetching) return <div className="flex-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="sticky top-0 z-40 w-full glass border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href={`/admin/competition/${id}`} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              ← Competition
            </Link>
            <h1 className="text-xl font-bold gradient-text">Question Builder</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 animate-fade-in flex gap-8 flex-col lg:flex-row">
        
        {/* Sidebar for rounds */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-[var(--text-primary)]">Rounds</h2>
            <Button variant="ghost" size="sm" className="text-xs">+ Add</Button>
          </div>
          <div className="flex flex-col gap-2">
            {competition?.rounds?.map(round => (
              <button
                key={round.id}
                onClick={() => setSelectedRoundId(round.id)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  selectedRoundId === round.id 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium' 
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div className="line-clamp-1">{round.title}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{round._count?.questions || 0} questions</div>
              </button>
            ))}
            {(!competition?.rounds || competition.rounds.length === 0) && (
              <div className="text-sm text-[var(--text-muted)] p-4 border border-dashed rounded-lg text-center">
                No rounds available.
              </div>
            )}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
              <CardDescription>Create a new question for the selected round.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <select 
                      value={qType}
                      onChange={(e) => setQType(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-[var(--border-color)] bg-transparent focus:border-[var(--accent-primary)] focus:outline-none"
                    >
                      <option value="MCQ">Multiple Choice</option>
                      <option value="TRUE_FALSE">True / False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                      <option value="MATCH">Match the Following</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marks (+)</Label>
                      <Input type="number" min="0" step="0.5" value={qMarks} onChange={e => setQMarks(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Negative (-)</Label>
                      <Input type="number" min="0" step="0.5" value={qNegMarks} onChange={e => setQNegMarks(e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border border-[var(--border-color)] bg-transparent p-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] resize-y"
                    placeholder="Enter your question here..."
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    required
                  />
                </div>

                {/* For MVP demo, omitting the dynamic options builder UI which would normally go here */}
                <div className="p-4 bg-[var(--bg-tertiary)] rounded border border-dashed border-[var(--border-color)] text-sm text-[var(--text-muted)] text-center">
                  [Options Builder UI goes here. For this demo, placeholder options will be saved.]
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" variant="primary" isLoading={isSubmitting}>
                    Add Question
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
