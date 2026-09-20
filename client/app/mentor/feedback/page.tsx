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

export default function MentorFeedbackPage() {
  const { user, token, isLoading: authLoading } = useAuth();

  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetails | null>(null);

  const [interviews, setInterviews] = useState<InterviewPerformance[]>([]);

  const [selectedInterview, setSelectedInterview] =
    useState<string | null>(null);

  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===============================
  // FETCH STUDENTS
  // ===============================

  useEffect(() => {
    if (authLoading || !token || user?.role !== "Mentor") return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get("/api/mentor/students");

        if (response.data.success) {
          setStudents(response.data.students);
        }
      } catch (err: any) {
        console.error("Failed to fetch students:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load students"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [authLoading, token, user]);

  // ===============================
  // FETCH STUDENT PERFORMANCE
  // ===============================

  const handleSelectStudent = async (
    student: StudentPerformance
  ) => {
    try {
      setDetailsLoading(true);
      setError("");
      setSuccess("");

      setSelectedStudent({
        id: student.studentId,
        name: student.name,
        email: student.email,
      });

      setSelectedInterview(null);

      const response = await axiosInstance.get(
        `/api/mentor/students/${student.studentId}`
      );

      if (response.data.success) {
        setInterviews(response.data.performance.interviews || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch student performance:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load student performance"
      );

      setInterviews([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ===============================
  // HANDLE FEEDBACK CHANGE
  // ===============================

  const handleFeedbackChange = (
    interviewId: string,
    value: string
  ) => {
    setFeedback((prev) => ({
      ...prev,
      [interviewId]: value,
    }));
  };

  // ===============================
  // SEND FEEDBACK
  // ===============================

  const handleSendFeedback = async (
    interviewId: string
  ) => {
    const text = feedback[interviewId]?.trim();

    if (!text) {
      setError("Please enter feedback before sending.");
      return;
    }

    try {
      setFeedbackLoading(interviewId);
      setError("");
      setSuccess("");

      const response = await axiosInstance.put(
        `/api/mentor/feedback/${interviewId}`,
        {
          feedback: text,
        }
      );

      if (response.data.success) {
        setSuccess("Feedback sent successfully to the student.");

        // Update local interview data
        setInterviews((prev) =>
          prev.map((interview) =>
            interview._id === interviewId
              ? {
                  ...interview,
                  mentorFeedback: text,
                  mentorFeedbackSent: true,
                  mentorFeedbackSentAt: new Date().toISOString(),
                }
              : interview
          )
        );

        // Clear textarea
        setFeedback((prev) => ({
          ...prev,
          [interviewId]: "",
        }));
      }
    } catch (err: any) {
      console.error("Failed to send feedback:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to send feedback"
      );
    } finally {
      setFeedbackLoading(null);
    }
  };

  // ===============================
  // ROLE PROTECTION
  // ===============================

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "Mentor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-xl font-semibold text-red-600">
            Access Denied
          </h1>

          <p className="mt-2 text-gray-600">
            Only mentors can access the feedback page.
          </p>
        </Card>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            💬 Student Feedback
          </h1>

          <p className="mt-2 text-gray-600">
            Review student interview performance and provide
            personalized feedback.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ========================= */}
          {/* STUDENT LIST */}
          {/* ========================= */}

          <Card className="p-5 h-fit">
            <h2 className="text-xl font-semibold mb-4">
              Students
            </h2>

            {loading ? (
              <p className="text-gray-500">
                Loading students...
              </p>
            ) : students.length === 0 ? (
              <p className="text-gray-500">
                No students found.
              </p>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <button
                    key={student.studentId}
                    onClick={() =>
                      handleSelectStudent(student)
                    }
                    className={`w-full text-left rounded-lg border p-4 transition ${
                      selectedStudent?.id === student.studentId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">
                      {student.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {student.email}
                    </p>

                    <div className="mt-2 flex justify-between text-sm">
                      <span>
                        Interviews:{" "}
                        {student.totalInterviews}
                      </span>

                      <span className="font-medium">
                        Avg: {student.averageScore}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* ========================= */}
          {/* FEEDBACK SECTION */}
          {/* ========================= */}

          <div className="lg:col-span-2">

            {!selectedStudent ? (
              <Card className="p-10 text-center">
                <div className="text-5xl mb-4">
                  👨‍🎓
                </div>

                <h2 className="text-xl font-semibold">
                  Select a Student
                </h2>

                <p className="mt-2 text-gray-500">
                  Select a student from the left to review
                  their interviews and provide feedback.
                </p>
              </Card>
            ) : detailsLoading ? (
              <Card className="p-10 text-center">
                <p className="text-gray-500">
                  Loading student performance...
                </p>
              </Card>
            ) : (
              <>
                {/* STUDENT HEADER */}

                <Card className="p-6 mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedStudent.name}
                  </h2>

                  <p className="text-gray-500">
                    {selectedStudent.email}
                  </p>
                </Card>

                {/* INTERVIEWS */}

                {interviews.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      No completed interviews found for this
                      student.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-6">

                    {interviews.map((interview) => (
                      <Card
                        key={interview._id}
                        className="p-6"
                      >

                        {/* INTERVIEW HEADER */}

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {interview.company ||
                                "Interview"}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {interview.domain ||
                                "General"}{" "}
                              •{" "}
                              {new Date(
                                interview.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                              Score:{" "}
                              {interview.score ?? 0}
                            </span>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                              {interview.difficulty ||
                                "Medium"}
                            </span>
                          </div>
                        </div>

                        {/* PERFORMANCE */}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

                          <div className="rounded-lg bg-green-50 p-4">
                            <h4 className="font-semibold text-green-700">
                              Strengths
                            </h4>

                            {interview.strengths?.length ? (
                              <ul className="mt-2 list-disc pl-5 text-sm">
                                {interview.strengths.map(
                                  (item, index) => (
                                    <li key={index}>
                                      {item}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">
                                No strengths recorded.
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg bg-red-50 p-4">
                            <h4 className="font-semibold text-red-700">
                              Weaknesses
                            </h4>

                            {interview.weaknesses?.length ? (
                              <ul className="mt-2 list-disc pl-5 text-sm">
                                {interview.weaknesses.map(
                                  (item, index) => (
                                    <li key={index}>
                                      {item}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">
                                No weaknesses recorded.
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg bg-yellow-50 p-4">
                            <h4 className="font-semibold text-yellow-700">
                              Improvements
                            </h4>

                            {interview.improvements?.length ? (
                              <ul className="mt-2 list-disc pl-5 text-sm">
                                {interview.improvements.map(
                                  (item, index) => (
                                    <li key={index}>
                                      {item}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="mt-2 text-sm text-gray-500">
                                No improvements recorded.
                              </p>
                            )}
                          </div>

                        </div>

                        {/* AI FEEDBACK */}

                        {interview.feedback && (
                          <div className="mt-5 rounded-lg bg-gray-50 p-4">
                            <h4 className="font-semibold mb-2">
                              🤖 AI Feedback
                            </h4>

                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {interview.feedback}
                            </p>
                          </div>
                        )}

                        {/* PREVIOUS MENTOR FEEDBACK */}

                        {interview.mentorFeedbackSent &&
                          interview.mentorFeedback && (
                            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                              <h4 className="font-semibold text-green-700">
                                ✓ Previously Sent Feedback
                              </h4>

                              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                {interview.mentorFeedback}
                              </p>

                              {interview.mentorFeedbackSentAt && (
                                <p className="mt-2 text-xs text-gray-500">
                                  Sent on{" "}
                                  {new Date(
                                    interview.mentorFeedbackSentAt
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}

                        {/* FEEDBACK FORM */}

                        <div className="mt-6">

                          <label className="block font-semibold mb-2">
                            Mentor Feedback
                          </label>

                          <textarea
                            value={
                              feedback[interview._id] || ""
                            }
                            onChange={(e) =>
                              handleFeedbackChange(
                                interview._id,
                                e.target.value
                              )
                            }
                            placeholder="Write personalized feedback for the student..."
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />

                          <div className="mt-3 flex justify-end">

                            <button
                              onClick={() =>
                                handleSendFeedback(
                                  interview._id
                                )
                              }
                              disabled={
                                feedbackLoading ===
                                interview._id
                              }
                              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {feedbackLoading ===
                              interview._id
                                ? "Sending..."
                                : interview.mentorFeedbackSent
                                ? "Update Feedback"
                                : "Send to Student"}
                            </button>

                          </div>

                        </div>

                      </Card>
                    ))}

                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}