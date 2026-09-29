"use client";

import { type ReactNode, useRef, useEffect } from "react";
import { type StoreApi } from "zustand";
import { UserType, ListsType, FolderType, TaskType } from "@/lib/schemas/database.types";
import { createUserDataStore, UserStoreContext, type UserState } from "@/store/useUserDataStore";
import { getUserCosmeticsCatalogAction } from "@/lib/api/cosmetics/actions";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import {
  saveSidebarToIndexedDB,
  loadSidebarFromIndexedDB,
  reconcileWithOfflineState,
  isListDeleted,
} from "@/lib/offline/sidebarSync";

import { createUserPreferencesStore, UserPreferencesContext } from "@/store/useUserPreferencesStore";

import { useShopStore } from "@/store/useShopStore";

interface Props {
  children: ReactNode;
  user: UserType | null;
  initialSidebarCollapsed: boolean;
  initialSidebarPosition: "left" | "right";
  initialListsData?: {
    lists: ListsType[];
    folders: FolderType[];
    tasks?: TaskType[];
    hasMoreRoot: boolean;
  } | null;
}

export const UserStoreProvider = ({
  children,
  user,
  initialSidebarCollapsed,
  initialSidebarPosition,
  initialListsData,
}: Props) => {
  const storeRef = useRef<StoreApi<UserState> | null>(null);
  const prefsStoreRef = useRef<any>(null);

  if (!storeRef.current) {
    storeRef.current = createUserDataStore({ user });
    const initialCoins = user?.alino_coins;
    if (typeof initialCoins === "number" && useShopStore.getState().coins === 0) {
      useShopStore.setState({ coins: initialCoins });
    }
  }

  if (!prefsStoreRef.current) {
    const dbPrefs = (user?.user_private?.preferences || {}) as any;
    prefsStoreRef.current = createUserPreferencesStore({
      ...dbPrefs,
      sidebarCollapsed: initialSidebarCollapsed,
      sidebarPosition: initialSidebarPosition,
    });
  }

  if (initialListsData && !useTodoDataStore.getState().initialFetch) {
    const rawTasks = initialListsData.tasks ?? [];
    useTodoDataStore.setState({
      lists: (initialListsData.lists ?? []).filter((l) => !isListDeleted(l.list_id)),
      folders: initialListsData.folders ?? [],
      tasks: rawTasks.filter((t) => !t.completed),
      completedTasks: rawTasks.filter((t) => t.completed === true),
      listsPagination: {
        root: { page: 0, hasMore: initialListsData.hasMoreRoot ?? false },
      },
      initialFetch: true,
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function hydrateSidebar() {
      if (!initialListsData) {
        const local = await loadSidebarFromIndexedDB();
        if (isMounted && (local.lists.length > 0 || local.folders.length > 0 || local.tasks.length > 0)) {
          const rawTasks = local.tasks ?? [];
          useTodoDataStore.setState({
            lists: local.lists,
            folders: local.folders,
            tasks: rawTasks.filter((t) => !t.completed),
            completedTasks: rawTasks.filter((t) => t.completed === true),
            listsPagination: {
              root: { page: 0, hasMore: false },
            },
            initialFetch: true,
          });
        }
        return;
      }

      const reconciled = await reconcileWithOfflineState(
        initialListsData.lists ?? [],
        initialListsData.folders ?? [],
        initialListsData.tasks ?? []
      );

      if (isMounted) {
        const rawTasks = reconciled.tasks ?? initialListsData.tasks ?? [];
        useTodoDataStore.setState({
          lists: reconciled.lists,
          folders: reconciled.folders,
          tasks: rawTasks.filter((t) => !t.completed),
          completedTasks: rawTasks.filter((t) => t.completed === true),
          listsPagination: {
            root: { page: 0, hasMore: initialListsData.hasMoreRoot ?? false },
          },
          initialFetch: true,
        });

        await saveSidebarToIndexedDB(
          reconciled.lists,
          reconciled.folders,
          rawTasks
        );
      }
    }

    hydrateSidebar();

    return () => {
      isMounted = false;
    };
  }, [initialListsData]);


  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user-preferences") || "{}");
      if (stored.animations !== undefined) {
        prefsStoreRef.current?.setState({ animations: stored.animations });
      }
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      getUserCosmeticsCatalogAction().then((res) => {
        if (res.data?.cosmetics) {
          storeRef.current?.getState().setCosmeticsCatalog(res.data.cosmetics);
        }
      });
    }
  }, [user?.user_id]);

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      <UserPreferencesContext.Provider value={prefsStoreRef.current}>
        {children}
      </UserPreferencesContext.Provider>
    </UserStoreContext.Provider>
  );
};

