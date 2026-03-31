"use client";
import { useState } from "react";
import { AIGeneratedTask } from "@/lib/ai/aiProvider";

interface UseAITaskGenerationReturn {
  generate: (prompt: string, maxTasks: number) => Promise<{ listSubject: string; tasks: AIGeneratedTask[] } | null>;
  loading: boolean;
  error: string | null;
}

export function useAITaskGeneration(): UseAITaskGenerationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    prompt: string,
    maxTasks: number,
  ): Promise<{ listSubject: string; tasks: AIGeneratedTask[] } | null> => {
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
        setError(data.error ?? "Error desconocido.");
        return null;
      }

      return {
        listSubject: data.listSubject as string,
        tasks: data.tasks as AIGeneratedTask[],
      };
    } catch {
      setError("No se pudo conectar con el servidor.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
