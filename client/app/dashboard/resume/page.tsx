"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ResumePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a resume.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);

      const { data } = await axiosInstance.post(
        "/api/resume/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

    //   console.log(data);
    //   alert("Resume analyzed successfully!");
    setAnalysis(data.analysis);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>

        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />

        {file && (
          <p className="text-sm text-muted-foreground">
            Selected File: {file.name}
          </p>
        )}

        <Button onClick={handleAnalyze} disabled={loading} className="w-full">
          {loading ? "Analyzing..." : "Analyze Resume"}
        </Button>

        {analysis && (
          <Card className="p-6 mt-6 space-y-6">
            <h2 className="text-2xl font-bold">Resume Analysis Result</h2>

            <p>
              <strong>Resume Score:</strong> {analysis.resumeScore}%
            </p>

            <p>
              <strong>Placement Readiness:</strong>{" "}
              {analysis.placementReadiness}%
            </p>

            <div>
              <h3 className="font-bold">Summary</h3>
              <p>{analysis.summary}</p>
            </div>

            <div>
              <h3 className="font-bold">Experience Level</h3>
              <p>{analysis.experienceLevel}</p>
            </div>

            <div>
              <h3 className="font-bold">Skills</h3>
              <ul className="list-disc ml-6">
                {analysis.skillsDetected?.map(
                  (skill: string, index: number) => (
                    <li key={index}>{skill}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Strengths</h3>
              <ul className="list-disc ml-6">
                {analysis.strengths?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Missing Skills</h3>
              <ul className="list-disc ml-6">
                {analysis.missingSkills?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Recommendations</h3>
              <ul className="list-disc ml-6">
                {analysis.recommendations?.map(
                  (item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Roadmap</h3>
              <ul className="list-disc ml-6">
                {analysis.roadmap?.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold">Recommended Domains</h3>

              {analysis.recommendedDomains?.map((item: any, index: number) => (
                <Card key={index} className="p-3 mt-3">
                  <p>
                    <strong>{item.label}</strong>
                  </p>

                  <p>{item.reason}</p>

                  <p>Confidence : {item.confidence}%</p>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ResumePage;