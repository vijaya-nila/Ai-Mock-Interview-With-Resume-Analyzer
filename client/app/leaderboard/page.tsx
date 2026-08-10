"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LeaderboardUser {
  rank: number;
  userId: string;
  score: number;
  totalInterviews: number;
  lastInterview: string;
}

const LeaderboardPage = () => {
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axiosInstance.get("/api/leaderboard");

      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Leaderboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading leaderboard...
        </p>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const remainingUsers = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black">
              🏆 Leaderboard
            </h1>

            <p className="text-muted-foreground mt-1">
              Compare your interview performance with other candidates
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            ← Dashboard
          </Button>
        </div>

        {/* Top 3 */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {topThree.map((user) => (
              <Card
                key={user.userId}
                className={`p-6 text-center ${
                  user.rank === 1
                    ? "border-yellow-400 shadow-lg md:-translate-y-2"
                    : ""
                }`}
              >
                <div className="text-5xl mb-3">
                  {user.rank === 1
                    ? "🥇"
                    : user.rank === 2
                    ? "🥈"
                    : "🥉"}
                </div>

                <p className="text-sm text-muted-foreground">
                  Rank #{user.rank}
                </p>

                <h2 className="text-3xl font-black text-primary mt-2">
                  {user.score}%
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  Best Score
                </p>

                <div className="mt-4 text-sm">
                  <p>
                    🎯 {user.totalInterviews} Interviews
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Ranking Table */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">
              📊 Overall Rankings
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground">
                No completed interviews yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-4">Rank</th>
                    <th className="text-left p-4">User</th>
                    <th className="text-center p-4">Best Score</th>
                    <th className="text-center p-4">
                      Interviews
                    </th>
                    <th className="text-right p-4">
                      Last Interview
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leaderboard.map((user) => (
                    <tr
                      key={user.userId}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-bold">
                        {user.rank <= 3
                          ? ["🥇", "🥈", "🥉"][user.rank - 1]
                          : `#${user.rank}`}
                      </td>

                      <td className="p-4">
                        <span className="font-medium">
                          User {user.userId.slice(-6)}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-bold text-primary">
                          {user.score}%
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {user.totalInterviews}
                      </td>

                      <td className="p-4 text-right text-sm text-muted-foreground">
                        {new Date(
                          user.lastInterview
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            🚀 Keep practicing and improve your ranking!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;