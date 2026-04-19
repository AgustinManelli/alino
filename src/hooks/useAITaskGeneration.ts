"use client";
import { useState } from "react";
import { AIGeneratedTask } from "@/lib/ai/aiProvider";

interface UseAITaskGenerationReturn {
  generate: (
    prompt: string,
    maxTasks: number | null,
  ) => Promise<{
    data: { listSubject: string; tasks: AIGeneratedTask[] } | null;
    error: string | null;
  }>;
  loading: boolean;
  error: string | null;
}

export function useAITaskGeneration(): UseAITaskGenerationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    prompt: string,
    maxTasks: number | null,
  ): Promise<{
    data: { listSubject: string; tasks: AIGeneratedTask[] } | null;
    error: string | null;
  }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, maxTasks }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error ?? "Error desconocido.";
        setError(errMsg);
        return { data: null, error: errMsg };
      }

      return {
        data: {
          listSubject: data.listSubject as string,
          tasks: data.tasks as AIGeneratedTask[],
        },
        error: null,
      };
    } catch {
      const errMsg = "No se pudo conectar con el servidor.";
      setError(errMsg);
      return { data: null, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
