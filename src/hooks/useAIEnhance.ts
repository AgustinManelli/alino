"use client";
import { useState } from "react";
import { EnhanceAction } from "@/lib/ai/aiProvider";

interface UseAIEnhanceReturn {
  enhance: (text: string, action: EnhanceAction) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useAIEnhance(): UseAIEnhanceReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhance = async (
    text: string,
    action: EnhanceAction,
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error desconocido.");
        return null;
      }

      return data.result as string;
    } catch {
      setError("No se pudo conectar con el servidor.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { enhance, loading, error };
}
