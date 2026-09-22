"use client";
import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { FolderType, ListsType, TaskType } from "@/lib/schemas/database.types";
import { AIGeneratedTask } from "@/lib/ai/aiProvider";

export interface GenerateAndCreateListParams {
  prompt: string;
  maxTasks?: number | null;
  color?: string;
  icon?: string | null;
  folderId?: string | null;
}

export interface GenerateAndCreateListResult {
  folders: FolderType[];
  lists: ListsType[];
  list: ListsType;
  tasks: TaskType[];
  credits: any;
  tokenUsage?: any;
}

interface UseAITaskGenerationReturn {
  generate: (
    prompt: string,
    maxTasks: number | null
  ) => Promise<{
    data: { listSubject: string; tasks: AIGeneratedTask[] } | null;
    error: string | null;
  }>;
  generateAndCreateList: (
    params: GenerateAndCreateListParams
  ) => Promise<{
    data: GenerateAndCreateListResult | null;
    error: string | null;
  }>;
  loading: boolean;
  error: string | null;
}

export function useAITaskGeneration(): UseAITaskGenerationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generación y creación jerárquica autónoma en el backend:
   * La IA procesa y persiste atómicamente carpetas, listas con emojis/colores y tareas en Supabase.
   * El cliente sincroniza el store de Zustand con todos los elementos creados.
   */
  const generateAndCreateList = useCallback(
    async (
      params: GenerateAndCreateListParams
    ): Promise<{
      data: GenerateAndCreateListResult | null;
      error: string | null;
    }> => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/ai/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: params.prompt,
            maxTasks: params.maxTasks,
            color: params.color,
            icon: params.icon,
            folderId: params.folderId,
            saveToDb: true,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.error ?? "Error al procesar con IA.";
          setError(errMsg);
          return { data: null, error: errMsg };
        }

        const createdFolders = (data.folders || []) as FolderType[];
        const createdLists = (data.lists || (data.list ? [data.list] : [])) as ListsType[];
        const createdTasks = (data.tasks || []) as TaskType[];

        // Inyectar atómicamente en el store de Zustand
        useTodoDataStore.setState((state) => {
          const existingFolderIds = new Set(state.folders.map((f) => f.folder_id));
          const existingListIds = new Set(state.lists.map((l) => l.list_id));
          const existingTaskIds = new Set(state.tasks.map((t) => t.task_id));

          const uniqueFolders = createdFolders.filter((f) => !existingFolderIds.has(f.folder_id));
          const uniqueLists = createdLists.filter((l) => !existingListIds.has(l.list_id));
          const uniqueTasks = createdTasks.filter((t) => !existingTaskIds.has(t.task_id));

          return {
            folders: [...uniqueFolders, ...state.folders],
            lists: [...uniqueLists, ...state.lists],
            tasks: [...uniqueTasks, ...state.tasks],
          };
        });

        // Actualizar créditos en el store de usuario si vino la info
        if (data.credits) {
          globalUserStore?.getState().setAIUsage(data.credits);
        }

        return {
          data: {
            folders: createdFolders,
            lists: createdLists,
            list: createdLists[0] || data.list,
            tasks: createdTasks,
            credits: data.credits,
            tokenUsage: data.tokenUsage,
          },
          error: null,
        };
      } catch (err) {
        const errMsg = "No se pudo conectar con el servidor.";
        setError(errMsg);
        return { data: null, error: errMsg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Generación solo en memoria (para componentes con flujo de confirmación previo)
   */
  const generate = useCallback(
    async (
      prompt: string,
      maxTasks: number | null
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
          body: JSON.stringify({ prompt, maxTasks, saveToDb: false }),
        });

        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.error ?? "Error desconocido.";
          setError(errMsg);
          return { data: null, error: errMsg };
        }

        const tasksMapped: AIGeneratedTask[] = (data.tasks || []).map((t: any) => ({
          text: t.task_content
            ? t.task_content.replace(/<[^>]*>/g, "").trim()
            : t.text || "",
          type: t.type || (t.completed === null ? "note" : "check"),
          target_date: t.target_date || null,
        }));

        return {
          data: {
            listSubject: data.listSubject || data.list?.list?.list_name || "Lista Generada",
            tasks: tasksMapped,
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
    },
    []
  );

  return { generate, generateAndCreateList, loading, error };
}
