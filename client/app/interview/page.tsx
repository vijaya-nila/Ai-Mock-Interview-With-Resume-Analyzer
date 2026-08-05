"use client";

import InterviewContent from "@/components/InterviewContent";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();

  const domain = searchParams.get("domain") || "";
  const company = searchParams.get("company") || "";

  return (
    <Suspense fallback={<div>is loading..</div>}>
      <InterviewContent
        domain={domain}
        company={company}
      />
    </Suspense>
  );
};

export default Page;