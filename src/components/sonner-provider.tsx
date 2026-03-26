"use client";

import { Toaster } from "sonner";

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "sonner-toast",
        style: {
          background:
            "linear-gradient(175deg, oklch(0.90 0.03 85) 0%, oklch(0.85 0.05 75) 50%, oklch(0.82 0.04 70) 100%)",
          border: "2px solid oklch(0.65 0.06 70)",
          color: "oklch(0.25 0.04 60)",
          fontFamily: '"Jeju Hallasan", system-ui, sans-serif',
          boxShadow:
            "0 4px 12px oklch(0 0 0 / 0.3), inset 0 0 12px oklch(0.78 0.05 75 / 0.2)",
        },
      }}
    />
  );
}
