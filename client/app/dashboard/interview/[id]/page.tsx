"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Message {
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

interface Interview {
  _id: string;
  company: string;
  domain: string;
  difficulty: string;
  companyReadiness: string;
  score: number;
  duration: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  messages: Message[];
  createdAt: string;
}

const Page = () => {
  const router = useRouter();
  const params = useParams();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterview();
  }, []);

  const fetchInterview = async () => {
    try {
      const { data } = await axiosInstance.get(`/api/interviews/${params.id}`);

      setInterview(data.interview);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading Interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Interview Not Found</h2>

          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Interview Report</h1>

          {/* <p className="text-muted-foreground mt-1">
            Company: {interview.company}
          </p> */}

          {/* <p className="text-muted-foreground">Domain: {interview.domain}</p> */}
        </div>

        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          ← Back
        </Button>
      </div>

      {/* Score Card */}

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-sm text-muted-foreground">Overall Score</p>

            <h2 className="text-5xl font-black text-primary mt-2">
              {interview.score}%
            </h2>

            <p className="text-sm text-muted-foreground mt-2">
              Duration : {interview.duration} min
            </p>

            <p className="text-sm text-muted-foreground">
              Date : {new Date(interview.createdAt).toLocaleDateString()}
            </p>
          </div>

          <ScoreRing score={interview.score} />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl">🏢</p>
          <p className="text-sm text-muted-foreground mt-2">Company</p>
          <h3 className="font-bold">{interview.company}</h3>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl">💻</p>
          <p className="text-sm text-muted-foreground mt-2">Domain</p>
          <h3 className="font-bold">{interview.domain}</h3>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl">🎯</p>
          <p className="text-sm text-muted-foreground mt-2">Difficulty</p>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              interview.difficulty === "Easy"
                ? "bg-green-100 text-green-700"
                : interview.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {interview.difficulty}
          </span>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl">🏅</p>

          <p className="text-sm text-muted-foreground mt-2">
            Company Readiness
          </p>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              interview.companyReadiness === "Strong Fit"
                ? "bg-green-100 text-green-700"
                : interview.companyReadiness === "Potential Fit"
                  ? "bg-blue-100 text-blue-700"
                  : interview.companyReadiness === "Needs Improvement"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
            }`}
          >
            {interview.companyReadiness}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl">⏱</p>
          <p className="text-sm text-muted-foreground mt-2">Duration</p>
          <h3 className="font-bold">{interview.duration} min</h3>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl">📅</p>
          <p className="text-sm text-muted-foreground mt-2">Date</p>
          <h3 className="font-bold">
            {new Date(interview.createdAt).toLocaleDateString()}
          </h3>
        </Card>
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">📊 Performance Breakdown</h2>

        {[
          {
            label: "Technical Knowledge",
            value: Math.min(interview.score + 5, 100),
          },
          {
            label: "Communication",
            value: Math.max(interview.score - 10, 0),
          },
          {
            label: "Problem Solving",
            value: Math.min(interview.score + 2, 100),
          },
        ].map((item, index) => (
          <div key={index} className="mb-5 last:mb-0">
            <div className="flex justify-between mb-2">
              <span className="font-medium">{item.label}</span>

              <span className="font-bold">{item.value}%</span>
            </div>

            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                style={{
                  width: `${item.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </Card>
      {/* Overall Feedback */}

      <Card className="p-6 border-l-4 border-blue-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl">
            🧠
          </div>

          <div>
            <h2 className="text-xl font-bold">Overall Feedback</h2>

            <p className="text-sm text-muted-foreground">
              AI Interview Evaluation
            </p>
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-5">
          <p className="leading-8 text-muted-foreground">
            {interview.feedback}
          </p>
        </div>
      </Card>

      {/* Strengths */}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-green-600">✅ Strengths</h2>

        <ul className="space-y-2">
          {interview.strengths.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span>✔️</span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Weaknesses */}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-orange-500">⚠ Weaknesses</h2>

        <ul className="space-y-2">
          {interview.weaknesses.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span>•</span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Improvements */}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-600">
          🚀 Improvements
        </h2>

        <ul className="space-y-2">
          {interview.improvements.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span>➡️</span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Conversation */}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">💬 Interview Conversation</h2>

        <div className="space-y-5">
          {interview.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "ai"
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">
                    {msg.role === "ai" ? "🤖 AI Interviewer" : "👨‍💻 You"}
                  </span>

                  <span className="text-[10px] opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-sm whitespace-pre-wrap leading-7">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Buttons */}

      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          ← Back to Dashboard
        </Button>

        <Button
          className="bg-gradient-to-r from-primary to-accent text-white"
          onClick={() =>
            router.push(
              `/interview?domain=${encodeURIComponent(interview.domain)}`,
            )
          }
        >
          🔄 Retake Interview
        </Button>
      </div>
    </div>
  );
};

function ScoreRing({ score }: { score: number }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "#22c55e"
      : score >= 60
      ? "#3b82f6"
      : "#f97316";

  return (
    <div className="relative w-40 h-40">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="8"
          fill="none"
          className="text-muted"
          stroke="currentColor"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          strokeWidth="8"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black">
          {score}%
        </h2>

        <p className="text-xs text-muted-foreground">
          AI Score
        </p>
      </div>
    </div>
  );
}
export default Page;
