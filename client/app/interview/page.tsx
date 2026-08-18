import React, { Suspense } from "react";
import InterviewContent from "@/components/InterviewContent";

const Page = () => {
  return (
    <Suspense fallback={<div>Loading interview...</div>}>
      <InterviewContent />
    </Suspense>
  );
};

export default Page;