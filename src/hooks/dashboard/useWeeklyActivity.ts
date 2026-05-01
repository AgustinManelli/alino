"use client";

import { useState, useCallback } from "react";
import { getWeeklyActivity } from "@/lib/api/dashboard/actions";
import { customToast } from "@/lib/toasts";

export type WeeklyActivityData = {
  date: string;
  completed_count: number;
};

export function useWeeklyActivity() {
  const [data, setData] = useState<WeeklyActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data: result, error: apiError } = await getWeeklyActivity(timezone);
      if (apiError) {
        setError(apiError);
        customToast.error("Error al cargar actividad semanal");
      } else {
        setData(result || []);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(msg);
      customToast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchWeeklyActivity,
  };
}
