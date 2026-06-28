"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Interview {
  id: string;
  date: string;
  score: number;
  duration: number;
  topic: string;
}

const INTERVIEW_DOMAINS = [
  { label: "JavaScript/Node.js", icon: "🟨" },
  { label: "React", icon: "⚛️" },
  { label: "Python", icon: "🐍" },
  { label: "Data Science", icon: "📊" },
  { label: "DevOps", icon: "⚙️" },
  { label: "System Design", icon: "🏗️" },
  { label: "Database Design", icon: "🗄️" },
  { label: "General", icon: "🎯" },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
      : score >= 60
      ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
      : "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold ${color}`}>
      {score >= 80 ? "🟢" : score >= 60 ? "🔵" : "🟠"} {score}%
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState<string>("All");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, authLoading, router]);

  useEffect(() => {
    if (isLoggedIn) fetchInterviews();
  }, [isLoggedIn]);

  const fetchInterviews = async () => {
    try {
      setDataLoading(true);
      const { data } = await axiosInstance.get("/api/interviews");
      setInterviews(data.interviews || []);
    } catch (error) {
      console.error("Failed to fetch interviews:", error);
    } finally {
      setDataLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const avgScore = interviews.length
    ? Math.round(interviews.reduce((s, i) => s + i.score, 0) / interviews.length)
    : null;
  const bestScore = interviews.length ? Math.max(...interviews.map((i) => i.score)) : null;
  const totalMinutes = interviews.reduce((s, i) => s + i.duration, 0);

  const uniqueDomains = ["All", ...Array.from(new Set(interviews.map((i) => i.topic)))];
  const filtered = filterDomain === "All" ? interviews : interviews.filter((i) => i.topic === filterDomain);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">📊 My Sessions</p>
            <h1 className="text-3xl md:text-4xl font-black text-foreground">Interview History</h1>
          </div>
          <Button
            size="lg"
            onClick={() => router.push("/practice")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-full px-6 font-semibold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
          >
            🎯 New Practice
          </Button>
        </section>

        {/* Stats */}
        {interviews.length > 0 && (
          <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                label: "Total Sessions",
                value: interviews.length.toString(),
                sub: `${interviews.length} session${interviews.length !== 1 ? "s" : ""}`,
                icon: "📋",
              },
              {
                label: "Average Score",
                value: avgScore !== null ? `${avgScore}%` : "—",
                sub:
                  avgScore !== null
                    ? avgScore >= 80 ? "Excellent 🔥" : avgScore >= 60 ? "Good 👍" : "Keep going 💪"
                    : "No data yet",
                icon: "📊",
                accent: true,
              },
              {
                label: "Practice Time",
                value:
                  totalMinutes >= 60
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    : `${totalMinutes}m`,
                sub: "Total invested",
                icon: "⏱",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className={`p-5 border ${
                  (stat as any).accent ? "border-primary/30 bg-primary/[0.03]" : "border-border/50"
                } hover:border-primary/40 transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <p
                  className={`text-2xl font-black mb-0.5 ${
                    (stat as any).accent
                      ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                      : "text-foreground"
                  }`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </Card>
            ))}
          </section>
        )}

        {/* Filter + List */}
        <section>
          {interviews.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">Your completed practice sessions</p>
              {uniqueDomains.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {uniqueDomains.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDomain(d)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        filterDomain === d
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {dataLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 border border-border/50">
                  <div className="animate-pulse flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="w-16 h-8 bg-muted rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-border">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-bold text-foreground mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Complete a practice interview and your sessions will appear here.
              </p>
              <Button
                onClick={() => router.push("/practice")}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-full px-5 text-sm"
              >
                🎯 Start Practicing
              </Button>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-8 text-center border border-border/50">
              <p className="text-muted-foreground text-sm">No sessions for "{filterDomain}"</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {[...filtered].reverse().map((interview) => {
                const meta = INTERVIEW_DOMAINS.find((d) => d.label === interview.topic);
                return (
                  <Card
                    key={interview.id}
                    className="p-5 border border-border/50 hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-primary/30 transition-colors">
                        {meta?.icon || "🎯"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-foreground text-sm truncate">{interview.topic}</p>
                          <ScoreBadge score={interview.score} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          <span>
                            📅{" "}
                            {new Date(interview.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>⏱ {interview.duration} min</span>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-1 w-28">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            style={{ width: `${interview.score}%` }}
                          />
                        </div>
                        <p className="text-xs font-semibold text-foreground">{interview.score}%</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="rounded-full text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                          onClick={() => router.push(`/interview?domain=${encodeURIComponent(interview.topic)}`)}
                        >
                          Retake
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
