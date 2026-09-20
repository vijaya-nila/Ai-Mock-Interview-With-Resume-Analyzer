"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "Student" | "Mentor" | "Administrator";
  createdAt?: string;
}

interface SystemSettings {
  registrationEnabled: boolean;
  interviewEnabled: boolean;
  maintenanceMode: boolean;
}

const AdminDashboard = () => {
  const { user, token, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;

      if (!token || !user) {
        setLoading(false);
        return;
      }

      if (user.role !== "Administrator") {
        setError("Access denied. Administrator only.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [usersResponse, settingsResponse] =
          await Promise.all([
            axiosInstance.get("/api/admin/users"),
            axiosInstance.get("/api/admin/settings"),
          ]);

        setUsers(usersResponse.data.users || []);
        setSettings(settingsResponse.data.settings || null);
      } catch (error: any) {
        console.error("Admin Dashboard Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user, authLoading]);

  const formatDate = (date?: string) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString();
  };

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (item) => item.role === "Student"
  ).length;

  const totalMentors = users.filter(
    (item) => item.role === "Mentor"
  ).length;

  const totalAdministrators = users.filter(
    (item) => item.role === "Administrator"
  ).length;

  const recentUsers = [...users]
    .sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Administrator Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Overview of your AI Mock Interview platform.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Total Users
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : totalUsers}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Students
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : totalStudents}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Mentors
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : totalMentors}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Administrators
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : totalAdministrators}
            </h2>
          </Card>

        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          {/* System Status */}
          <Card className="p-6">

            <h2 className="text-xl font-semibold mb-6">
              System Status
            </h2>

            {loading ? (
              <p className="text-muted-foreground">
                Loading system status...
              </p>
            ) : settings ? (
              <div className="space-y-5">

                {/* Registration */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      User Registration
                    </p>

                    <p className="text-sm text-muted-foreground">
                      New account registration
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      settings.registrationEnabled
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {settings.registrationEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>

                {/* Interview */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Interview System
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Mock interview availability
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      settings.interviewEnabled
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {settings.interviewEnabled
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>

                {/* Maintenance */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Maintenance Mode
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Application maintenance status
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      settings.maintenanceMode
                        ? "bg-red-500/10 text-red-600"
                        : "bg-green-500/10 text-green-600"
                    }`}
                  >
                    {settings.maintenanceMode
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

              </div>
            ) : (
              <p className="text-muted-foreground">
                System settings unavailable.
              </p>
            )}

          </Card>

          {/* User Distribution */}
          <Card className="p-6">

            <h2 className="text-xl font-semibold mb-6">
              User Distribution
            </h2>

            {loading ? (
              <p className="text-muted-foreground">
                Loading user data...
              </p>
            ) : (
              <div className="space-y-6">

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Students</span>
                    <span className="font-medium">
                      {totalStudents}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width:
                          totalUsers > 0
                            ? `${(totalStudents / totalUsers) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Mentors</span>
                    <span className="font-medium">
                      {totalMentors}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width:
                          totalUsers > 0
                            ? `${(totalMentors / totalUsers) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Administrators</span>
                    <span className="font-medium">
                      {totalAdministrators}
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width:
                          totalUsers > 0
                            ? `${(totalAdministrators / totalUsers) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

              </div>
            )}

          </Card>

        </div>

        {/* Recent Users */}
        <div className="mt-8">

          <h2 className="text-xl font-semibold mb-4">
            Recently Registered Users
          </h2>

          <Card className="overflow-hidden">

            {loading ? (
              <div className="p-6 text-muted-foreground">
                Loading users...
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-6 text-muted-foreground">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">
                        Name
                      </th>

                      <th className="text-left p-4">
                        Email
                      </th>

                      <th className="text-left p-4">
                        Role
                      </th>

                      <th className="text-left p-4">
                        Registered
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentUsers.map((item) => (
                      <tr
                        key={item._id}
                        className="border-t border-border"
                      >
                        <td className="p-4 font-medium">
                          {item.name}
                        </td>

                        <td className="p-4">
                          {item.email}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-muted">
                            {item.role}
                          </span>
                        </td>

                        <td className="p-4">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </Card>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;