"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Challenge {
  _id: string;
  title: string;
  description: string;
  category: "HR" | "Technical" | "Aptitude" | "Domain-Specific";
  domain?: string;
  company?: string;
  type: "Daily" | "Weekly";
  difficulty: "Easy" | "Medium" | "Hard";
  questions: string[];
}

const ChallengeDetailsPage = () => {
  const params = useParams();
  const router = useRouter();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axiosInstance.get(
          `/api/challenges/${params.id}`
        );

        setChallenge(data.challenge);
      } catch (err) {
        console.error("Fetch Challenge Error:", err);
        setError("Failed to load challenge.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchChallenge();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading challenge...
        </p>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          {error || "Challenge not found"}
        </p>

        <Button
          variant="outline"
          onClick={() => router.push("/challenges")}
        >
          ← Back to Challenges
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push("/challenges")}
        >
          ← Back to Challenges
        </Button>

        {/* Challenge Header */}
        <Card className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {challenge.title}
              </h1>

              <p className="text-muted-foreground mt-2">
                {challenge.description}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                challenge.difficulty === "Easy"
                  ? "bg-green-100 text-green-700"
                  : challenge.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {challenge.difficulty}
            </span>
          </div>

          {/* Challenge Details */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="bg-muted px-3 py-1 rounded-full text-sm">
              🎯 {challenge.category}
            </span>

            <span className="bg-muted px-3 py-1 rounded-full text-sm">
              📅 {challenge.type}
            </span>

            {challenge.domain && (
              <span className="bg-muted px-3 py-1 rounded-full text-sm">
                💻 {challenge.domain}
              </span>
            )}

            {challenge.company && (
              <span className="bg-muted px-3 py-1 rounded-full text-sm">
                🏢 {challenge.company}
              </span>
            )}
          </div>
        </Card>

        {/* Questions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-5">
            📝 Challenge Questions
          </h2>

          <div className="space-y-4">
            {challenge.questions.map((question, index) => (
              <div
                key={index}
                className="border rounded-lg p-4"
              >
                <p className="font-medium">
                  Q{index + 1}. {question}
                </p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default ChallengeDetailsPage;