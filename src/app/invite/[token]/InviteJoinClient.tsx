"use client";
import Link from "next/link";

interface Props {
  status: "error" | "invalid";
  message: string;
}

export function InviteJoinClient({ status, message }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "var(--background-primary, #0f0f0f)",
      }}
    >
      <div
        style={{
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            backgroundColor:
              status === "error"
                ? "rgba(239,68,68,.12)"
                : "rgba(156,163,175,.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "4px",
          }}
        >
          {status === "error" ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(239,68,68)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(156,163,175)"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
        </div>

        <h1
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text, #f5f5f5)",
            margin: 0,
          }}
        >
          {status === "error" ? "Ocurrió un error" : "Enlace no disponible"}
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "var(--text-not-available, #888)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            backgroundColor: "#87189d",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
            transition: "background-color .15s ease",
          }}
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
