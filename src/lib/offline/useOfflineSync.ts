"use client";

import { useEffect, useRef } from "react";
import { useSyncStore } from "@/store/useSyncStore";
import { processSyncQueue } from "./sidebarSync";
import { offlineDb } from "./db";

export function useOfflineSync() {
  const setIsOnline = useSyncStore((state) => state.setIsOnline);
  const setPendingSyncCount = useSyncStore((state) => state.setPendingSyncCount);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        if (navigator.onLine) {
          processSyncQueue();
        }
      }, 800);
    };

    const handleOffline = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setIsOnline(false);
    };

    setIsOnline(navigator.onLine);

    if (offlineDb) {
      offlineDb.syncQueue.count().then((count) => {
        setPendingSyncCount(count);
        if (navigator.onLine && count > 0) {
          processSyncQueue();
        }
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline, setPendingSyncCount]);
}

