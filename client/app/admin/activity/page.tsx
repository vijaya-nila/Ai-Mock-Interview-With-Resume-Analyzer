"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";

interface ActivityLog {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: "success" | "failure";
  timestamp: string;
  device: string;
  ipAddress: string;
}

interface SecurityAlert {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  type: string;
  message: string;
  severity: "low" | "medium" | "high";
  ipAddress: string;
  deviceInfo: string;
  isRead: boolean;
  createdAt: string;
}

const ActivityMonitoring = () => {
  const { user, token, isLoading: authLoading } = useAuth();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivityData = async () => {
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

        const [loginResponse, alertResponse] = await Promise.all([
          axiosInstance.get("/api/admin/login-history"),
          axiosInstance.get("/api/admin/security-alerts"),
        ]);

        setLogs(loginResponse.data.history || []);
        setAlerts(alertResponse.data.alerts || []);
      } catch (error: any) {
        console.error("Activity Monitoring Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load activity data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [token, user, authLoading]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const successfulLogins = logs.filter(
    (log) => log.status === "success"
  ).length;

  const failedLogins = logs.filter(
    (log) => log.status === "failure"
  ).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Activity Monitoring
          </h1>

          <p className="mt-2 text-muted-foreground">
            Monitor login activity and security alerts.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Successful Logins
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : successfulLogins}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Failed Login Attempts
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : failedLogins}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Security Alerts
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : alerts.length}
            </h2>
          </Card>

        </div>

        {/* Login History */}
        <div className="mb-10">

          <h2 className="text-xl font-semibold mb-4">
            Login History
          </h2>

          <Card className="overflow-hidden">

            {loading ? (
              <div className="p-6 text-muted-foreground">
                Loading login history...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-6 text-muted-foreground">
                No login history found.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">
                        User
                      </th>

                      <th className="text-left p-4">
                        Status
                      </th>

                      <th className="text-left p-4">
                        Device
                      </th>

                      <th className="text-left p-4">
                        IP Address
                      </th>

                      <th className="text-left p-4">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="border-t border-border"
                      >

                        <td className="p-4">
                          <div className="font-medium">
                            {log.user?.name || "Unknown"}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {log.user?.email || "Unknown"}
                          </div>
                        </td>

                        <td className="p-4">
                          {log.status === "success" ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-600">
                              Success
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-600">
                              Failure
                            </span>
                          )}
                        </td>

                        <td className="p-4 max-w-xs truncate">
                          {log.device || "Unknown"}
                        </td>

                        <td className="p-4">
                          {log.ipAddress || "Unknown"}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </Card>
        </div>

        {/* Security Alerts */}
        <div>

          <h2 className="text-xl font-semibold mb-4">
            Security Alerts
          </h2>

          <Card className="overflow-hidden">

            {loading ? (
              <div className="p-6 text-muted-foreground">
                Loading security alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-muted-foreground">
                No security alerts found.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4">
                        User
                      </th>

                      <th className="text-left p-4">
                        Alert Type
                      </th>

                      <th className="text-left p-4">
                        Message
                      </th>

                      <th className="text-left p-4">
                        Severity
                      </th>

                      <th className="text-left p-4">
                        IP Address
                      </th>

                      <th className="text-left p-4">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {alerts.map((alert) => (
                      <tr
                        key={alert._id}
                        className="border-t border-border"
                      >

                        <td className="p-4">
                          <div className="font-medium">
                            {alert.user?.name || "Unknown"}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {alert.user?.email || "Unknown"}
                          </div>
                        </td>

                        <td className="p-4">
                          {alert.type}
                        </td>

                        <td className="p-4 max-w-sm">
                          {alert.message}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-600">
                            {alert.severity}
                          </span>
                        </td>

                        <td className="p-4">
                          {alert.ipAddress || "Unknown"}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {formatDate(alert.createdAt)}
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

export default ActivityMonitoring;