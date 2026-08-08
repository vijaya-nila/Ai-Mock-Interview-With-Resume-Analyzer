"use client";

import React, { useEffect, useState } from "react";
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

const categories = [
  "All",
  "HR",
  "Technical",
  "Aptitude",
  "Domain-Specific",
];

const ChallengePage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<"Daily" | "Weekly">("Daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `/api/challenges?type=${type}`;

      if (category !== "All") {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const { data } = await axiosInstance.get(url);

      setChallenges(data.challenges || []);
    } catch (err) {
      console.error("Fetch Challenges Error:", err);
      setError("Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [category, type]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black">
            🏆 Peer Challenge Arena
          </h1>

          <p className="text-muted-foreground">
            Practice interview challenges and improve your skills
          </p>
        </div>

        {/* Daily / Weekly */}
        <div className="flex justify-center gap-3">
          <Button
            variant={type === "Daily" ? "default" : "outline"}
            onClick={() => setType("Daily")}
          >
            📅 Daily
          </Button>

          <Button
            variant={type === "Weekly" ? "default" : "outline"}
            onClick={() => setType("Weekly")}
          >
            🗓 Weekly
          </Button>
        </div>

        {/* Categories */}
        <Card className="p-5">
          <h2 className="font-bold text-lg mb-4">Challenge Category</h2>

          <div className="flex flex-wrap gap-3">
            {categories.map((item) => (
              <Button
                key={item}
                variant={category === item ? "default" : "outline"}
                onClick={() => setCategory(item)}
              >
                {item === "All" && "🎯 "}
                {item === "HR" && "👥 "}
                {item === "Technical" && "💻 "}
                {item === "Aptitude" && "🧮 "}
                {item === "Domain-Specific" && "🎓 "}

                {item}
              </Button>
            ))}
          </div>
        </Card>

        {/* Challenge List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{type} Challenges</h2>

          {loading && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading challenges...</p>
            </Card>
          )}

          {error && !loading && (
            <Card className="p-8 text-center">
              <p className="text-red-500">{error}</p>

              <Button className="mt-4" onClick={fetchChallenges}>
                Try Again
              </Button>
            </Card>
          )}

          {!loading && !error && challenges.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-4xl mb-3">📭</p>

              <h3 className="font-bold text-lg">No challenges available</h3>

              <p className="text-sm text-muted-foreground mt-2">
                Try another category or challenge type.
              </p>
            </Card>
          )}

          {!loading && !error && challenges.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {challenges.map((challenge) => (
                <Card
                  key={challenge._id}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Challenge Header */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-xl font-bold">{challenge.title}</h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        {challenge.category}
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

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mt-4 leading-6">
                    {challenge.description}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-xs bg-muted px-3 py-1 rounded-full">
                      {challenge.type}
                    </span>

                    {challenge.domain && (
                      <span className="text-xs bg-muted px-3 py-1 rounded-full">
                        💻 {challenge.domain}
                      </span>
                    )}

                    {challenge.company && (
                      <span className="text-xs bg-muted px-3 py-1 rounded-full">
                        🏢 {challenge.company}
                      </span>
                    )}
                  </div>

                  {/* Questions Count */}
                  <p className="text-xs text-muted-foreground mt-4">
                    📝 {challenge.questions?.length || 0} question(s)
                  </p>

                  {/* Start Button */}
                  <Button
                    className="w-full mt-5"
                    onClick={() => {
                      window.location.href = `/challenges/${challenge._id}`;
                    }}
                  >
                    🚀 Start Challenge
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;