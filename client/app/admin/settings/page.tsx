"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios";

interface SystemSettings {
  registrationEnabled: boolean;
  interviewEnabled: boolean;
  maintenanceMode: boolean;
}

const SystemSettingsPage = () => {
  const { user, token, isLoading: authLoading } = useAuth();

  const [settings, setSettings] = useState<SystemSettings>({
    registrationEnabled: true,
    interviewEnabled: true,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
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

        const response = await axiosInstance.get(
          "/api/admin/settings"
        );

        if (response.data.settings) {
          setSettings({
            registrationEnabled:
              response.data.settings.registrationEnabled,
            interviewEnabled:
              response.data.settings.interviewEnabled,
            maintenanceMode:
              response.data.settings.maintenanceMode,
          });
        }
      } catch (error: any) {
        console.error("System Settings Error:", error);

        setError(
          error?.response?.data?.message ||
            "Failed to load system settings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token, user, authLoading]);

  const handleToggle = (
    setting: keyof SystemSettings
  ) => {
    setSettings((previous) => ({
      ...previous,
      [setting]: !previous[setting],
    }));

    setSuccess("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await axiosInstance.put(
        "/api/admin/settings",
        settings
      );

      if (response.data.settings) {
        setSettings({
          registrationEnabled:
            response.data.settings.registrationEnabled,
          interviewEnabled:
            response.data.settings.interviewEnabled,
          maintenanceMode:
            response.data.settings.maintenanceMode,
        });
      }

      setSuccess("System settings updated successfully.");
    } catch (error: any) {
      console.error("Update System Settings Error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to update system settings"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            System Settings
          </h1>

          <p className="mt-2 text-muted-foreground">
            Configure application-wide settings.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
            {success}
          </div>
        )}

        <Card className="p-6">

          {loading ? (
            <div className="text-muted-foreground">
              Loading system settings...
            </div>
          ) : (
            <div className="space-y-6">

              {/* Registration */}
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="font-semibold">
                    User Registration
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Allow new users to register accounts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleToggle("registrationEnabled")
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.registrationEnabled
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      settings.registrationEnabled
                        ? "left-7"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-border" />

              {/* Interviews */}
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="font-semibold">
                    Interview System
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Allow users to start mock interviews.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleToggle("interviewEnabled")
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.interviewEnabled
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      settings.interviewEnabled
                        ? "left-7"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-border" />

              {/* Maintenance */}
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="font-semibold">
                    Maintenance Mode
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Temporarily put the application into maintenance mode.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleToggle("maintenanceMode")
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.maintenanceMode
                      ? "bg-green-500"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                      settings.maintenanceMode
                        ? "left-7"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Save */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>

            </div>
          )}

        </Card>

      </div>
    </div>
  );
};

export default SystemSettingsPage;