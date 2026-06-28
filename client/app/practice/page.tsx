"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVIEW_DOMAINS = [
  { label: "JavaScript/Node.js", icon: "🟨", desc: "ES6+, async, Node runtime" },
  { label: "React", icon: "⚛️", desc: "Hooks, state, lifecycle" },
  { label: "Python", icon: "🐍", desc: "OOP, data structures, stdlib" },
  { label: "Data Science", icon: "📊", desc: "ML, pandas, statistics" },
  { label: "DevOps", icon: "⚙️", desc: "CI/CD, Docker, Kubernetes" },
  { label: "System Design", icon: "🏗️", desc: "Scalability, architecture" },
  { label: "Database Design", icon: "🗄️", desc: "SQL, NoSQL, indexing" },
  { label: "General", icon: "🎯", desc: "Behavioural & fundamentals" },
];

const TIPS = [
  { icon: "🎯", title: "Be specific", desc: "Use concrete examples and numbers when answering." },
  { icon: "⏱", title: "Manage time", desc: "Each session is 3 questions — aim for clear, concise answers." },
  { icon: "💡", title: "Think aloud", desc: "Walk through your reasoning to show problem-solving skills." },
  { icon: "🔄", title: "Practice often", desc: "Consistency beats cramming — short daily sessions work best." },
];

export default function PracticePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, authLoading, router]);

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

  const handleSelectDomain = (domain: string) => {
    router.push(`/interview?domain=${encodeURIComponent(domain)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Header */}
        <section>
          <p className="text-sm text-muted-foreground font-medium mb-1">🎯 Practice</p>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
            Choose a Domain
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Pick a topic below to start an AI-powered mock interview session. Each session has 3 questions with real-time feedback.
          </p>
        </section>

        {/* Domain Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERVIEW_DOMAINS.map((domain) => (
              <button
                key={domain.label}
                onMouseEnter={() => setHoveredDomain(domain.label)}
                onMouseLeave={() => setHoveredDomain(null)}
                onClick={() => handleSelectDomain(domain.label)}
                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-150 ${
                  hoveredDomain === domain.label
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/60 hover:border-primary/40 bg-card"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center text-2xl flex-shrink-0 group-hover:border-primary/30 transition-colors">
                  {domain.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{domain.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{domain.desc}</p>
                </div>
                <span
                  className={`text-primary transition-opacity text-sm flex-shrink-0 ${
                    hoveredDomain === domain.label ? "opacity-100" : "opacity-0"
                  }`}
                >
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">💬 Interview Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPS.map((tip) => (
              <Card key={tip.title} className="p-4 border border-border/50 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <div>
            <p className="text-sm font-bold text-foreground">Want tailored suggestions?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Upload your resume on the dashboard for AI-powered domain recommendations.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="rounded-full text-xs flex-shrink-0 ml-4"
          >
            Go to Dashboard →
          </Button>
        </section>
      </div>
    </div>
  );
}
