"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";

interface StudentPerformance {
  studentId: string;
  name: string;
  email: string;
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
}

interface InterviewPerformance {
  _id: string;
  domain?: string;
  company?: string;
  score?: number;
  difficulty?: string;
  feedback?: string;
  mentorFeedback?: string;
  mentorFeedbackSent?: boolean;
  mentorFeedbackSentAt?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  createdAt: string;
}

interface StudentDetails {
  id: string;
  name: string;
  email: string;
}

const MentorDashboard = () => {
  const { user, token, isLoading: authLoading } = useAuth();

  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetails | null>(null);

  const [interviews, setInterviews] = useState<InterviewPerformance[]>([]);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);

  const [sentFeedback, setSentFeedback] = useState<Record<string, boolean>>(
    {}
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // FETCH STUDENTS
  // ============================================================

  useEffect(() => {
    const fetchStudents = async () => {
      if (authLoading) return;

      if (!token || !user) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }

      if (user.role !== "Mentor") {
        setError("Access denied. Mentor only.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          "/api/mentor/students"
        );

        setStudents(response.data.students || []);
      } catch (error: any) {
        console.error("Mentor Dashboard Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load student performance"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, user, authLoading]);

  // ============================================================
  // VIEW STUDENT PERFORMANCE
  // ============================================================

  const viewStudentPerformance = async (studentId: string) => {
    try {
      setDetailsLoading(true);
      setError("");
      setSuccess("");

      const response = await axiosInstance.get(
        `/api/mentor/students/${studentId}`
      );

      setSelectedStudent(response.data.student);

      const studentInterviews =
        response.data.performance?.interviews || [];

      setInterviews(studentInterviews);

      // Clear old feedback input
      setFeedback({});

      // Check which interviews already have feedback
      const existingFeedback: Record<string, boolean> = {};

      studentInterviews.forEach(
        (interview: InterviewPerformance) => {
          if (interview.mentorFeedback?.trim()) {
            existingFeedback[interview._id] = true;
          }
        }
      );

      setSentFeedback(existingFeedback);
    } catch (error: any) {
      console.error("Student Performance Error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load student performance"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ============================================================
  // SEND FEEDBACK TO STUDENT
  // ============================================================

  const submitFeedback = async (interviewId: string) => {
    const text = feedback[interviewId]?.trim();

    if (!text) {
      setError("Please enter feedback before sending.");
      setSuccess("");
      return;
    }

    try {
      setFeedbackLoading(interviewId);
      setError("");
      setSuccess("");

      await axiosInstance.put(
        `/api/mentor/feedback/${interviewId}`, {
        feedback: text,
      });

      // Update feedback locally
      setInterviews((current) =>
        current.map((interview) =>
          interview._id === interviewId
            ? {
                ...interview,
                mentorFeedback: text,
              }
            : interview
        )
      );

      // Mark feedback as sent
      setSentFeedback((current) => ({
        ...current,
        [interviewId]: true,
      }));

      // Clear textarea
      setFeedback((current) => ({
        ...current,
        [interviewId]: "",
      }));

      setSuccess("Feedback sent to the student successfully.");
    } catch (error: any) {
      console.error("Feedback Error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to send feedback"
      );
    } finally {
      setFeedbackLoading(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  // ============================================================
  // MENTOR ROLE CHECK
  // ============================================================

  if (!user || user.role !== "Mentor") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            Access denied. Mentor only.
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Mentor Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Review student performance and provide feedback.
          </p>
        </div>

        {/* =====================================================
            ERROR MESSAGE
        ====================================================== */}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* =====================================================
            SUCCESS MESSAGE
        ====================================================== */}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
            {success}
          </div>
        )}

        {/* =====================================================
            STUDENTS PERFORMANCE
        ====================================================== */}

        <div>
          <h2 className="text-xl font-semibold mb-4">Students Performance</h2>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-6 text-muted-foreground">
                Loading student performance...
              </div>
            ) : students.length === 0 ? (
              <div className="p-6 text-muted-foreground">
                No student performance found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">Student</th>

                      <th className="text-left p-4">Interviews</th>

                      <th className="text-left p-4">Average Score</th>

                      <th className="text-left p-4">Best Score</th>

                      <th className="text-left p-4">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.studentId}
                        className="border-t border-border"
                      >
                        <td className="p-4">
                          <div className="font-medium">{student.name}</div>

                          <div className="text-xs text-muted-foreground">
                            {student.email}
                          </div>
                        </td>

                        <td className="p-4">{student.totalInterviews}</td>

                        <td className="p-4 font-semibold">
                          {student.averageScore}
                        </td>

                        <td className="p-4 font-semibold">
                          {student.bestScore}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() =>
                              viewStudentPerformance(student.studentId)
                            }
                            className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                          >
                            View Performance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* =====================================================
            STUDENT PERFORMANCE DETAILS
        ====================================================== */}

        {selectedStudent && (
          <div className="mt-10">
            {/* Student Header */}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Student Performance Details
                </h2>

                <p className="text-muted-foreground mt-1">
                  {selectedStudent.name} · {selectedStudent.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setInterviews([]);
                  setFeedback({});
                  setSentFeedback({});
                  setSuccess("");
                  setError("");
                }}
                className="px-3 py-2 rounded-md border border-border hover:bg-muted"
              >
                Close
              </button>
            </div>

            {/* =================================================
                PERFORMANCE REVIEW
            ================================================== */}

            {interviews.length > 0 && (
              <Card className="mb-8 p-6">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold">⭐ Performance Review</h3>

                  <p className="text-muted-foreground mt-1">
                    Review the student's strengths, weaknesses, and improvement
                    areas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Strengths */}

                  <div className="rounded-lg border border-border p-5">
                    <h4 className="font-semibold text-lg mb-3">💪 Strengths</h4>

                    {interviews.some(
                      (interview) =>
                        interview.strengths && interview.strengths.length > 0,
                    ) ? (
                      <ul className="space-y-2">
                        {interviews
                          .flatMap((interview) => interview.strengths || [])
                          .map((strength, index) => (
                            <li
                              key={`${strength}-${index}`}
                              className="text-sm text-muted-foreground"
                            >
                              • {strength}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No strengths recorded yet.
                      </p>
                    )}
                  </div>

                  {/* Weaknesses */}

                  <div className="rounded-lg border border-border p-5">
                    <h4 className="font-semibold text-lg mb-3">
                      ⚠️ Weaknesses
                    </h4>

                    {interviews.some(
                      (interview) =>
                        interview.weaknesses && interview.weaknesses.length > 0,
                    ) ? (
                      <ul className="space-y-2">
                        {interviews
                          .flatMap((interview) => interview.weaknesses || [])
                          .map((weakness, index) => (
                            <li
                              key={`${weakness}-${index}`}
                              className="text-sm text-muted-foreground"
                            >
                              • {weakness}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No weaknesses recorded yet.
                      </p>
                    )}
                  </div>

                  {/* Improvements */}

                  <div className="rounded-lg border border-border p-5">
                    <h4 className="font-semibold text-lg mb-3">
                      🚀 Improvements
                    </h4>

                    {interviews.some(
                      (interview) =>
                        interview.improvements &&
                        interview.improvements.length > 0,
                    ) ? (
                      <ul className="space-y-2">
                        {interviews
                          .flatMap((interview) => interview.improvements || [])
                          .map((improvement, index) => (
                            <li
                              key={`${improvement}-${index}`}
                              className="text-sm text-muted-foreground"
                            >
                              • {improvement}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No improvement suggestions recorded yet.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* =================================================
                INTERVIEW DETAILS + FEEDBACK
            ================================================== */}

            <Card className="overflow-hidden">
              {detailsLoading ? (
                <div className="p-6 text-muted-foreground">
                  Loading performance details...
                </div>
              ) : interviews.length === 0 ? (
                <div className="p-6 text-muted-foreground">
                  No completed interviews found for this student.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4">Domain</th>

                        <th className="text-left p-4">Company</th>

                        <th className="text-left p-4">Score</th>

                        <th className="text-left p-4">Difficulty</th>

                        <th className="text-left p-4">Feedback</th>

                        <th className="text-left p-4">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {interviews.map((interview) => (
                        <tr
                          key={interview._id}
                          className="border-t border-border"
                        >
                          {/* Domain */}

                          <td className="p-4">{interview.domain || "-"}</td>

                          {/* Company */}

                          <td className="p-4">{interview.company || "-"}</td>

                          {/* Score */}

                          <td className="p-4 font-semibold">
                            {interview.score ?? 0}
                          </td>

                          {/* Difficulty */}

                          <td className="p-4">{interview.difficulty || "-"}</td>

                          {/* Feedback */}

                          <td className="p-4 min-w-[300px]">
                            <textarea
                              value={feedback[interview._id] ?? ""}
                              onChange={(event) =>
                                setFeedback((current) => ({
                                  ...current,
                                  [interview._id]: event.target.value,
                                }))
                              }
                              placeholder={
                                interview.feedback
                                  ? "Enter new feedback..."
                                  : "Enter mentor feedback..."
                              }
                              className="w-full min-h-24 rounded-md border border-input bg-background p-3"
                            />

                            {/* Previously sent feedback */}

                            {interview.feedback && (
                              <div className="mt-3 p-3 rounded-md bg-muted/50 border border-border">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">
                                  Previously Sent Feedback
                                </p>

                                <p className="text-sm">{interview.feedback}</p>
                              </div>
                            )}
                          </td>

                          {/* Action */}

                          <td className="p-4">
                            <button
                              onClick={() => submitFeedback(interview._id)}
                              disabled={feedbackLoading === interview._id}
                              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                            >
                              {feedbackLoading === interview._id
                                ? "Sending..."
                                : interview.mentorFeedbackSent
                                  ? "Feedback Sent ✓"
                                  : "Send to Student"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;