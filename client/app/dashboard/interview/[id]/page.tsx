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
  domain: string;
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

          <p className="text-muted-foreground mt-1">{interview.domain}</p>
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

          <div className="w-full md:w-72">
            <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{
                  width: `${interview.score}%`,
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              AI Evaluation Score
            </p>
          </div>
        </div>
      </Card>

      {/* Overall Feedback */}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">🧠 Overall Feedback</h2>

        <p className="leading-7 text-muted-foreground">{interview.feedback}</p>
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
        <h2 className="text-xl font-bold mb-5">💬 Interview Conversation</h2>

        <div className="space-y-4">
          {interview.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl ${
                msg.role === "ai"
                  ? "bg-primary/5 border border-primary/20"
                  : "bg-muted"
              }`}
            >
              <p className="text-xs font-bold mb-2">
                {msg.role === "ai" ? "🤖 AI Interviewer" : "👨‍💻 You"}
              </p>

              <p className="text-sm leading-7 whitespace-pre-wrap">
                {msg.content}
              </p>
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

export default Page;
