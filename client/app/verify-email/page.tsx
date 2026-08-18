"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          setMessage("Verification token is missing.");
          setLoading(false);
          return;
        }

       const response = await fetch(
         `https://ai-mock-interview-with-resume-analyzer.onrender.com/api/auth/verify-email?token=${encodeURIComponent(token)}`,
       );

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message || "Email verified successfully!");
        } else {
          setMessage(data.message || "Email verification failed.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setMessage("Unable to verify email. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Email Verification</h1>

        <p>{message}</p>

        {!loading && (
          <a href="/login">
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
}