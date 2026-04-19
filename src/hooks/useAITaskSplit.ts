"use client";

import { useState, useCallback } from "react";
import type { AIGeneratedTask } from "@/lib/ai/aiProvider";
import type { TaskType } from "@/lib/schemas/database.types";

export interface SplitPreviewResult {
  tasks: AIGeneratedTask[];
  credits: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export interface SplitConfirmResult {
  tasks: TaskType[];
}

export function useAITaskSplit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useCallback(
    async (
      taskContent: string,
      maxSubtasks: number = 5
    ): Promise<{ data: SplitPreviewResult | null; error: string | null }> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/split", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskContent, maxSubtasks }),
        });

        const data = await res.json();

        if (!res.ok) {
          const errMsg = data.error ?? "Error al generar las subtareas.";
          setError(errMsg);
          return { data: null, error: errMsg };
        }

        return { data: { tasks: data.tasks, credits: data.credits }, error: null };
      } catch (err) {
        const errMsg = "No se pudo conectar con el servidor. Verificá tu connexión.";
        setError(errMsg);
        return { data: null, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const confirm = useCallback(
    async (
      tasks: AIGeneratedTask[],
      listId: string,
      taskRank: string | null,
      prevTaskRank: string | null
    ): Promise<{ data: SplitConfirmResult | null; error: string | null }> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/split/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks, listId, taskRank, prevTaskRank }),
        });

        const data = await res.json();

        if (!res.ok) {
          const errMsg = data.error ?? "Error al crear las subtareas.";
          setError(errMsg);
          return { data: null, error: errMsg };
        }

        return { data: { tasks: data.tasks as TaskType[] }, error: null };
      } catch (err) {
        const errMsg = "No se pudo conectar con el servidor. Verificá tu connexión.";
        setError(errMsg);
        return { data: null, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { preview, confirm, loading, error, clearError };
}
