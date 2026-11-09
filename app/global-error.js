"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadOnceForChunkError } from "@/lib/chunk-reload";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      reloadOnceForChunkError();
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#0b0b0f",
          color: "#f5f5f5",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, margin: "0 0 8px" }}>Something went wrong</h2>
          <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 16px" }}>
            Please refresh the page to continue.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: 8,
              padding: "10px 16px",
              background: "#f5f5f5",
              color: "#0b0b0f",
              fontWeight: 600,
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
