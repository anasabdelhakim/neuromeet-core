import { Suspense } from "react";
import Livekit from "./livekit";

export default async function LivekitWrapper({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; user?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Livekit searchParams={searchParams} />
    </Suspense>
  );
}
