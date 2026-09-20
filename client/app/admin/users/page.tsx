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

const UserManagement = () => {
  const { user, token, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
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

        const response = await axiosInstance.get("/api/admin/users");

        setUsers(response.data.users || []);
      } catch (error: any) {
        console.error("User Management Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, user, authLoading]);

  const formatDate = (date?: string) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>

          <p className="mt-2 text-muted-foreground">
            View and manage registered users.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Total Users
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : users.length}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Students
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading
                ? "..."
                : users.filter(
                    (user) => user.role === "Student"
                  ).length}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Mentors
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading
                ? "..."
                : users.filter(
                    (user) => user.role === "Mentor"
                  ).length}
            </h2>
          </Card>

        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">

          {loading ? (
            <div className="p-6 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
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

                  {users.map((item) => (
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

                      <td className="p-4 whitespace-nowrap">
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
  );
};

export default UserManagement;