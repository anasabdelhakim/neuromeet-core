"use client";

import { useEffect } from "react";
import { GlobalErrorView } from "@/src/components/ui/global-error-view";

export default function StudentDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student Dashboard caught an error:", error);
  }, [error]);

  return <GlobalErrorView error={error} reset={reset} />;
}
