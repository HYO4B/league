"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function TrackPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_TRACKING !== "true") return;
    if (typeof navigator !== "undefined" && (navigator as { doNotTrack?: string }).doNotTrack === "1") return;

    const body = JSON.stringify({ path: pathname });
    // Keep it fire-and-forget; don't block rendering.
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true
    }).catch(() => {});
  }, [pathname]);

  return null;
}

