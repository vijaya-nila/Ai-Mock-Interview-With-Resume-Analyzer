"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>

        <h1 className="text-3xl font-black">
          Access Denied
        </h1>

        <p className="text-muted-foreground mt-3 leading-6">
          You do not have permission to access this page.
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          Please return to a page available for your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            className="flex-1"
            onClick={() => router.back()}
          >
            ← Go Back
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
          >
            🏠 Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}