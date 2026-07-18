"use client";

import { useEffect } from "react";
import { GlobalErrorView } from "@/src/components/ui/global-error-view";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Dashboard caught an error:", error);
  }, [error]);

  return <GlobalErrorView error={error} reset={reset} />;
}
