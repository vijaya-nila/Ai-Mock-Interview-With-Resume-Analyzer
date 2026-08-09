"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
  isActive: boolean;
}

const AttemptPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const challengeId = params.id as string;
  const attemptId = searchParams.get("attemptId");

  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  // Fetch challenge
  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axiosInstance.get(
        `/api/challenges/${challengeId}`
      );

      const fetchedChallenge = data.challenge;

      setChallenge(fetchedChallenge);

      if (fetchedChallenge?.questions?.length > 0) {
        setQuestion(fetchedChallenge.questions[0]);
      } else {
        setQuestion(fetchedChallenge.description || "");
      }
    } catch (err) {
      console.error("Fetch Challenge Error:", err);
      setError("Failed to load challenge.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!challengeId || !attemptId) {
      setError("Invalid challenge attempt.");
      setLoading(false);
      return;
    }

    fetchChallenge();
  }, [challengeId, attemptId]);

  // Submit answer
  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer.");
      return;
    }

    if (!attemptId) {
      setError("Attempt ID is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const { data } = await axiosInstance.post(
        "/api/challenges/submit",
        {
          attemptId,
          question,
          answer,
        }
      );

      console.log("Challenge Evaluation:", data);

      setScore(data.score ?? 0);
      setTotalScore(data.totalScore ?? 0);
      setFeedback(data.feedback || "No feedback available.");
    } catch (err) {
      console.error("Submit Challenge Error:", err);
      setError("Failed to evaluate answer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Complete challenge
  const completeChallenge = async () => {
    if (!attemptId) {
      setError("Attempt ID is missing.");
      return;
    }

    try {
      setCompleting(true);
      setError("");

      const { data } = await axiosInstance.post(
        "/api/challenges/complete",
        {
          attemptId,
        }
      );

      console.log("Challenge Completed:", data);

      setCompleted(true);

      if (data.result) {
        setTotalScore(data.result.totalScore ?? totalScore);
        setFeedback(
          data.result.feedback || feedback || "Challenge completed."
        );
      }
    } catch (err) {
      console.error("Complete Challenge Error:", err);
      setError("Failed to complete challenge.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Loading challenge...
          </p>
        </Card>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-lg w-full">
          <p className="text-red-500">{error}</p>

          <Button
            className="mt-4"
            onClick={() => router.push("/challenges")}
          >
            Back to Challenges
          </Button>
        </Card>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/challenges")}
          >
            ← Back
          </Button>

          <div className="text-center mt-6">
            <h1 className="text-3xl md:text-4xl font-black">
              🚀 {challenge.title}
            </h1>

            <p className="text-muted-foreground mt-2">
              Complete the challenge and get AI-powered feedback.
            </p>
          </div>
        </div>

        {/* Challenge Information */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-3 mb-5">
            <span className="px-3 py-1 rounded-full bg-muted text-sm">
              {challenge.category}
            </span>

            <span className="px-3 py-1 rounded-full bg-muted text-sm">
              {challenge.type}
            </span>

            <span className="px-3 py-1 rounded-full bg-muted text-sm">
              {challenge.difficulty}
            </span>

            {challenge.domain && (
              <span className="px-3 py-1 rounded-full bg-muted text-sm">
                💻 {challenge.domain}
              </span>
            )}

            {challenge.company && (
              <span className="px-3 py-1 rounded-full bg-muted text-sm">
                🏢 {challenge.company}
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-7">
            {challenge.description}
          </p>
        </Card>

        {/* Question */}
        {!completed && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold">
                📝 Challenge Question
              </h2>

              <span className="text-sm text-muted-foreground">
                Question 1
              </span>
            </div>

            <div className="rounded-lg bg-muted p-5">
              <p className="text-lg font-semibold leading-7">
                {question}
              </p>
            </div>

            {/* Answer */}
            <div className="mt-6">
              <label className="font-semibold block mb-2">
                Your Answer
              </label>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={7}
                disabled={submitting}
                className="w-full rounded-lg border bg-background p-4 outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-3">
                {error}
              </p>
            )}

            <Button
              className="w-full mt-5"
              onClick={submitAnswer}
              disabled={submitting || !answer.trim()}
            >
              {submitting
                ? "🤖 AI Evaluating..."
                : "✨ Submit & Evaluate"}
            </Button>
          </Card>
        )}

        {/* Evaluation Result */}
        {score !== null && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-5">
              🤖 AI Evaluation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Score */}
              <div className="rounded-lg bg-muted p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Your Score
                </p>

                <p className="text-5xl font-black mt-2">
                  {score}
                  <span className="text-2xl">/100</span>
                </p>
              </div>

              {/* Total Score */}
              <div className="rounded-lg bg-muted p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Total Score
                </p>

                <p className="text-5xl font-black mt-2">
                  {totalScore}
                  <span className="text-2xl">/100</span>
                </p>
              </div>
            </div>

            {/* Feedback */}
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-2">
                💡 AI Feedback
              </h3>

              <div className="rounded-lg border p-5">
                <p className="text-muted-foreground leading-7">
                  {feedback}
                </p>
              </div>
            </div>

            {/* Complete */}
            {!completed && (
              <Button
                className="w-full mt-6"
                onClick={completeChallenge}
                disabled={completing}
              >
                {completing
                  ? "Completing..."
                  : "🏁 Complete Challenge"}
              </Button>
            )}
          </Card>
        )}

        {/* Completed Result */}
        {completed && (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">
              🎉
            </div>

            <h2 className="text-3xl font-black">
              Challenge Completed!
            </h2>

            <p className="text-muted-foreground mt-2">
              Great job! Your challenge has been successfully
              completed.
            </p>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                Final Score
              </p>

              <p className="text-5xl font-black mt-2">
                {totalScore}
                <span className="text-2xl">/100</span>
              </p>
            </div>

            {feedback && (
              <div className="mt-6 rounded-lg border p-5 text-left">
                <h3 className="font-bold mb-2">
                  💡 Feedback
                </h3>

                <p className="text-muted-foreground leading-7">
                  {feedback}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                className="flex-1"
                onClick={() => router.push("/challenges")}
              >
                🏆 Back to Challenges
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/dashboard")}
              >
                📊 Go to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AttemptPage;