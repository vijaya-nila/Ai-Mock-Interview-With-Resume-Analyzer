"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CandidateProfile {
  resumeScore: number;
  interviewScore: number;
  placementScore: number;
  status: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];

  roadmap: {
    technologies: string[];
    projects: string[];
    certifications: string[];
    interviewTopics: string[];
  };

  overallFeedback: string;
}
export default function CandidatePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get("/api/resume/candidate-profile");

      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            Loading Candidate Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Candidate Data Found</h2>

          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black">
            👤 Candidate Placement Profile
          </h1>

          <p className="text-muted-foreground mt-2">
            AI generated placement readiness report based on your resume and
            interview performance.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      {/* Score Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h2 className="font-semibold">📄 Resume Score</h2>

          <p className="text-4xl font-bold mt-3">{profile.resumeScore}%</p>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">🎤 Interview Score</h2>

          <p className="text-4xl font-bold mt-3">{profile.interviewScore}%</p>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">🚀 Placement Score</h2>

          <p className="text-4xl font-bold text-primary mt-3">
            {profile.placementScore}%
          </p>

          <p className="mt-2 font-semibold text-green-600">{profile.status}</p>

          {/* Placement Badge */}

          <p
            className={`mt-3 inline-block px-4 py-1 rounded-full text-sm font-bold ${
              profile.placementScore >= 80
                ? "bg-green-100 text-green-700"
                : profile.placementScore >= 60
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {profile.placementScore >= 80
              ? "🟢 Placement Ready"
              : profile.placementScore >= 60
                ? "🟡 Almost Ready"
                : "🔴 Needs Improvement"}
          </p>

          {/* Progress Bar */}

          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
              style={{
                width: `${profile.placementScore}%`,
              }}
            />
          </div>
        </Card>
      </div>
      {/* Skills */}

      <Card className="p-5">
        <h2 className="font-bold mb-3">🛠 Skills</h2>

        <div className="flex flex-wrap gap-2">
          {profile.skills.length > 0 ? (
            profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-muted-foreground">
              No skills detected from your resume.
            </p>
          )}
        </div>
      </Card>

      {/* Overall Feedback */}

      <Card className="p-5">
        <h2 className="font-bold mb-3">🧠 Overall Feedback</h2>

        <p className="leading-7 text-muted-foreground">
          {profile.overallFeedback}
        </p>
      </Card>

      {/* Strengths & Weaknesses */}

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="font-bold text-green-600 mb-3">✅ Strengths</h2>

          {profile.strengths.length > 0 ? (
            <ul className="space-y-2">
              {profile.strengths.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span>✔️</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No strengths available.</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-bold text-red-600 mb-3">⚠ Weaknesses</h2>

          {profile.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {profile.weaknesses.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No weaknesses available.</p>
          )}
        </Card>
      </div>

      {/* Recommendations */}

      <Card className="p-5">
        <h2 className="font-bold text-blue-600 mb-3">🚀 AI Recommendations</h2>

        {profile.recommendations.length > 0 ? (
          <ul className="space-y-2">
            {profile.recommendations.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span>➡️</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No recommendations available.</p>
        )}
      </Card>

      {/* AI Roadmap */}

      <Card className="p-5">
        <h2 className="font-bold text-purple-600 mb-4">
          🛣 Personalized Learning Roadmap
        </h2>

        <div className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2">💻 Technologies</h3>
            <ul className="list-disc ml-6">
              {profile.roadmap?.technologies?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">📂 Projects</h3>
            <ul className="list-disc ml-6">
              {profile.roadmap?.projects?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🎓 Certifications</h3>
            <ul className="list-disc ml-6">
              {profile.roadmap?.certifications?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">🎤 Interview Topics</h3>
            <ul className="list-disc ml-6">
              {profile.roadmap?.interviewTopics?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Bottom Button */}

      <div className="flex justify-center">
        <Button
          onClick={() => router.push("/dashboard")}
          className="bg-gradient-to-r from-primary to-accent text-white px-6"
        >
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
}