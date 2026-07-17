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

      <h1 className="text-4xl font-black">
        👤 My Profile
      </h1>

      <Card className="p-6">

        <h2 className="text-2xl font-bold">
          {profile.name}
        </h2>

        <p className="text-muted-foreground mt-2">
          {profile.email}
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          Joined :
          {" "}
          {new Date(profile.joined).toLocaleDateString()}
        </p>

      </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Card className="p-6 text-center">

          <div className="text-4xl mb-3">🎤</div>

          <p className="text-sm text-muted-foreground">
            Total Interviews
          </p>

          <h2 className="text-3xl font-black mt-2">
            {profile.totalInterviews}
          </h2>

        </Card>

        <Card className="p-6 text-center">

          <div className="text-4xl mb-3">⭐</div>

          <p className="text-sm text-muted-foreground">
            Average Score
          </p>

          <h2 className="text-3xl font-black mt-2">
            {profile.averageScore}%
          </h2>

        </Card>

        <Card className="p-6 text-center">

          <div className="text-4xl mb-3">🏆</div>

          <p className="text-sm text-muted-foreground">
            Best Score
          </p>

          <h2 className="text-3xl font-black mt-2">
            {profile.bestScore}%
          </h2>

        </Card>

      </div>
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