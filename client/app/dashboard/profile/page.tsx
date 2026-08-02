"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);




  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axiosInstance.get("/api/resume/history");
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    };
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/api/resume/candidate-profile",
        );

        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="p-6">Loading Candidate Profile...</div>;
  }

  if (!profile) {
    return <div className="p-6">No Candidate Profile Found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">Candidate Profile</h1>
        <p>
          <strong>Candidate Type:</strong> {profile.candidateType}
        </p>
        <p>
          <strong>Resume Score:</strong> {profile.resumeScore}%
        </p>

        <p>
          <strong>Interview Score:</strong> {profile.interviewScore}%
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">Skills</h2>

        <ul className="list-disc ml-6">
          {profile.skills?.map((skill: string, index: number) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">Strengths</h2>

        <ul className="list-disc ml-6">
          {profile.strengths?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">Weaknesses</h2>

        <ul className="list-disc ml-6">
          {profile.weaknesses?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">Recommendations</h2>

        <ul className="list-disc ml-6">
          {profile.recommendations?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">Overall Feedback</h2>

        <p>{profile.overallFeedback}</p>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">Placement Readiness</h2>

        <p className="mb-3">
          <strong>Placement Score:</strong> {profile.placementScore}%
        </p>

        <div className="flex items-center gap-2">
          <strong>Status:</strong>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold
        ${
          profile.status === "Placement Ready"
            ? "bg-green-100 text-green-700"
            : profile.status === "High Potential Candidate"
              ? "bg-blue-100 text-blue-700"
              : profile.status === "Needs Improvement"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
        }`}
          >
            {profile.status}
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">📜 Placement History</h2>

        {history.length === 0 ? (
          <p>No history found.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  <p>Candidate Type: {item.candidateType}</p>

                  <p>Placement Score: {item.placementScore}%</p>

                  <p>Status: {item.status}</p>
                </div>

                <div className="text-sm text-gray-500">
                  Resume: {item.resumeScore}% <br />
                  Interview: {item.interviewScore}%
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">📈 Progress Report</h2>

        {profile.progressReport ? (
          <>
            <p>
              <strong>Score Change:</strong>{" "}
              {profile.progressReport.scoreChange > 0 ? "+" : ""}
              {profile.progressReport.scoreChange}%
            </p>

            <p className="mt-2">
              <strong>Progress:</strong> {profile.progressReport.progress}
            </p>

            <p className="mt-2">
              <strong>Recommendation:</strong>{" "}
              {profile.progressReport.recommendation}
            </p>
          </>
        ) : (
          <p>
            This is your first assessment. Complete more interviews to track
            your improvement.
          </p>
        )}
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-3">AI Learning Roadmap</h2>

        <h3 className="font-semibold">Technologies</h3>
        <ul className="list-disc ml-6">
          {profile.roadmap?.technologies?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3 className="font-semibold mt-4">Projects</h3>
        <ul className="list-disc ml-6">
          {profile.roadmap?.projects?.map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3 className="font-semibold mt-4">Certifications</h3>
        <ul className="list-disc ml-6">
          {profile.roadmap?.certifications?.map(
            (item: string, index: number) => (
              <li key={index}>{item}</li>
            ),
          )}
        </ul>

        <h3 className="font-semibold mt-4">Interview Topics</h3>
        <ul className="list-disc ml-6">
          {profile.roadmap?.interviewTopics?.map(
            (item: string, index: number) => (
              <li key={index}>{item}</li>
            ),
          )}
        </ul>
      </Card>
    </div>
  );
}