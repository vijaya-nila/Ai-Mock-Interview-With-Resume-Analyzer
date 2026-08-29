
"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { canAccessRoute } from "@/lib/permissions";

interface RoleGuardProps {
  children: ReactNode;
}

export function RoleGuard({ children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in
    if (!isLoggedIn || !user) {
      router.replace("/login");
      return;
    }

    // Check route permission
    if (!canAccessRoute(user.role, pathname)) {
      router.replace("/unauthorized");
    }
  }, [isLoading, isLoggedIn, user, pathname, router]);

  // Wait while authentication is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            Checking authorization...
          </p>
        </div>
      </div>
    );
  }

  // Do not render protected content if user is not authenticated
  if (!isLoggedIn || !user) {
    return null;
  }

  // Do not render restricted content
  if (!canAccessRoute(user.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}

