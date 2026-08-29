export type Role = "Student" | "Mentor" | "Administrator";

export type Permission =
  | "view_dashboard"
  | "view_practice"
  | "view_sessions"
  | "view_leaderboard"
  | "view_profile"
  | "view_challenges"
  | "manage_challenges"
  | "review_performance"
  | "provide_feedback"
  | "admin_dashboard"
  | "manage_users"
  | "monitor_activity"
  | "manage_settings";

export const rolePermissions: Record<Role, Permission[]> = {
  Student: [
    "view_dashboard",
    "view_practice",
    "view_sessions",
    "view_leaderboard",
    "view_profile",
    "view_challenges",
  ],

  Mentor: [
    "view_dashboard",
    "view_practice",
    "view_sessions",
    "view_leaderboard",
    "view_profile",
    "view_challenges",
    "manage_challenges",
    "review_performance",
    "provide_feedback",
  ],

  Administrator: [
    "view_dashboard",
    "view_profile",
    "admin_dashboard",
    "manage_users",
    "monitor_activity",
    "manage_settings",
  ],
};

export const hasPermission = (
  role: Role | undefined,
  permission: Permission
): boolean => {
  if (!role) return false;

  return rolePermissions[role]?.includes(permission) ?? false;
};

/**
 * Frontend route → allowed roles
 */
export const protectedRoutes = {
  "/dashboard": ["Student", "Mentor", "Administrator"],
  "/practice": ["Student", "Mentor"],
  "/history": ["Student", "Mentor"],
  "/leaderboard": ["Student", "Mentor"],
  "/profile": ["Student", "Mentor", "Administrator"],
  "/challenges": ["Student", "Mentor"],
  "/mentor": ["Mentor"],
  "/admin": ["Administrator"],
} as const;

/**
 * Check whether a role can access a frontend route.
 */
export const canAccessRoute = (
  role: Role | undefined,
  route: string
): boolean => {
  if (!role) return false;

  const allowedRoles =
    protectedRoutes[route as keyof typeof protectedRoutes];

  // Route is not protected by this RBAC configuration
  if (!allowedRoles) return true;

  return (allowedRoles as readonly Role[]).includes(role);
};