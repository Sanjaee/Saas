"use client";

import { TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1rem",
            background: "#fafafa",
          }}
        >
          <TriangleAlert size={48} style={{ color: "#dc2626" }} />
          <h1 style={{ marginTop: "1.5rem", fontSize: "1.75rem" }}>Critical error</h1>
          <p style={{ color: "#71717a", maxWidth: "28rem", marginTop: "0.5rem" }}>
            The application failed to load. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "2rem",
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid #e4e4e7",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
