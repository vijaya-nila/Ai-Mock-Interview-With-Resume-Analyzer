"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

interface Profile {
  name: string;
  email: string;
  joined: string;
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
}

const Page = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Change Password states
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const fetchProfile = async () => {
    try {
      const { data } = await axiosInstance.get("/api/users/profile");
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // Change Password
  // ======================================================

  const handleChangePassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters long"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      const { data } = await axiosInstance.put(
        "/api/users/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setPasswordMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Change Password Error:", error);

      setPasswordError(
        error.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">

      {/* ================================================== */}
      {/* Page Title */}
      {/* ================================================== */}

      <div>
        <h1 className="text-4xl font-black">
          👤 My Profile
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your profile and account settings
        </p>
      </div>

      {/* ================================================== */}
      {/* Profile Information */}
      {/* ================================================== */}

      <Card className="p-6 border-0 shadow-md">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
            👤
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {profile.name}
            </h2>

            <p className="text-muted-foreground mt-1">
              {profile.email}
            </p>

            <p className="text-sm text-muted-foreground mt-1">
              Joined{" "}
              {new Date(profile.joined).toLocaleDateString()}
            </p>
          </div>

        </div>

      </Card>

      {/* ================================================== */}
      {/* Interview Statistics */}
      {/* ================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl">
            🎤
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Total Interviews
          </p>

          <h2 className="text-3xl font-black mt-2">
            {profile.totalInterviews}
          </h2>

        </Card>

        <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-500/10 flex items-center justify-center text-3xl">
            ⭐
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Average Score
          </p>

          <h2 className="text-3xl font-black mt-2">
            {profile.averageScore}%
          </h2>

        </Card>

        <Card className="p-6 text-center border-0 shadow-md hover:shadow-lg transition">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl">
            🏆
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Best Score
          </p>

          <h2 className="text-3xl font-black mt-2">
            {profile.bestScore}%
          </h2>

        </Card>

      </div>

      {/* ================================================== */}
      {/* Change Password */}
      {/* ================================================== */}

      <Card className="overflow-hidden border-0 shadow-md">

        {/* Header */}
        <button
          type="button"
          onClick={() => {
            setShowChangePassword(!showChangePassword);
            setPasswordError("");
            setPasswordMessage("");
          }}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-muted/40 transition"
        >

          <div className="flex items-center gap-4">

            {/* Security Icon */}
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
              🔐
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Change Password
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Keep your account secure with a strong password
              </p>

            </div>

          </div>

          {/* Arrow */}
          <div
            className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-transform duration-300 ${
              showChangePassword ? "rotate-180" : ""
            }`}
          >
            ↓
          </div>

        </button>

        {/* Form */}
        {showChangePassword && (

          <div className="border-t bg-muted/20 p-6">

            <form
              onSubmit={handleChangePassword}
              className="max-w-2xl space-y-5"
            >

              {/* Current Password */}
              <div>

                <label className="block text-sm font-semibold mb-2">
                  Current Password
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔑
                  </span>

                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter your current password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />

                </div>

              </div>

              {/* New Password */}
              <div>

                <label className="block text-sm font-semibold mb-2">
                  New Password
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔒
                  </span>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter your new password"
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />

                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  • Minimum 8 characters
                </p>

              </div>

              {/* Confirm Password */}
              <div>

                <label className="block text-sm font-semibold mb-2">
                  Confirm New Password
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🛡️
                  </span>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your new password"
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />

                </div>

              </div>

              {/* Error */}
              {passwordError && (

                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">

                  <span className="text-lg">
                    ⚠️
                  </span>

                  <span>
                    {passwordError}
                  </span>

                </div>

              )}

              {/* Success */}
              {passwordMessage && (

                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">

                  <span className="text-lg">
                    ✓
                  </span>

                  <span>
                    {passwordMessage}
                  </span>

                </div>

              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {passwordLoading
                    ? "Changing Password..."
                    : "Update Password"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  className="px-6 py-3 rounded-xl border font-semibold hover:bg-muted transition"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        )}

      </Card>

      {/* ================================================== */}
      {/* Back to Dashboard */}
      {/* ================================================== */}

      <div className="flex justify-center pt-4">

        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition"
        >
          ← Back to Dashboard
        </button>

      </div>

    </div>
  );
};

export default Page;