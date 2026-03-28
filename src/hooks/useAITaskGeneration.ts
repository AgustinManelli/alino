"use client";
import { useState } from "react";
import { AIGeneratedTask } from "@/lib/ai/aiProvider";

interface UseAITaskGenerationReturn {
  generate: (prompt: string, maxTasks: number) => Promise<AIGeneratedTask[]>;
  loading: boolean;
  error: string | null;
}

export function useAITaskGeneration(): UseAITaskGenerationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    prompt: string,
    maxTasks: number,
  ): Promise<AIGeneratedTask[]> => {
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
        return [];
      }

      return data.tasks as AIGeneratedTask[];
    } catch {
      setError("No se pudo conectar con el servidor.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
}
