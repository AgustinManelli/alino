"use client";

import { useEffect, useRef } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useTodoRealtime } from "@/hooks/todo/useTodoRealtime";
import { createClient } from "@/utils/supabase/client";
import { ListsRow, MembershipRow } from "@/lib/schemas/database.types";
import type { Notification as AppNotification } from "@/lib/schemas/notification.types";
import { getNotificationDisplay } from "@/lib/schemas/notification.types";
import { getMyNotifications } from "@/lib/api/notification/actions";
import { customToast } from "@/lib/toasts";
import { useUserDataStore } from "@/store/useUserDataStore";
import { usePresenceStore } from "@/store/usePresenceStore";
import {
  saveSingleFolderToIndexedDB,
  removeFolderFromIndexedDB,
  isListDeleted,
} from "@/lib/offline/sidebarSync";


export const RealtimeProvider = () => {
  const supabase = createClient();
  const user = useUserDataStore((s) => s.user);
  const setOnlineUserIds = usePresenceStore((s) => s.setOnlineUserIds);
  const addOnlineUser = usePresenceStore((s) => s.addOnlineUser);
  const removeOnlineUser = usePresenceStore((s) => s.removeOnlineUser);

  const {
    onAddList,
    onDeleteList,
    onUpdateList,
    onUpdateMembership,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
  } = useTodoRealtime();
  const lists = useTodoDataStore((s) => s.lists);
  const listsRef = useRef(lists);
  listsRef.current = lists;

  const folders = useTodoDataStore((s) => s.folders);
  const foldersRef = useRef(folders);
  foldersRef.current = folders;

  const addNotificationToStore = useNotificationsStore(
    (s) => s.addNotificationToStore,
  );

  useEffect(() => {
    const channel = supabase
      .channel("app-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "list_memberships",
        },
        (payload) => {
          const newMembership = payload.new as MembershipRow;
          if (newMembership?.list_id && isListDeleted(newMembership.list_id)) return;

          const currentUserId = user?.user_id;

          if (currentUserId && newMembership.user_id === currentUserId) {
            const exists = listsRef.current.some(
              (list) => list.list_id === newMembership.list_id,
            );
            if (!exists) onAddList(newMembership);
          } else {
            useTodoDataStore.setState((state) => ({
              lists: state.lists.map((l) => {
                if (l.list_id === newMembership.list_id) {
                  const currentNonOwnerCount = l.list.non_owner_count || 0;
                  return {
                    ...l,
                    list: {
                      ...l.list,
                      non_owner_count: currentNonOwnerCount + 1,
                      is_shared: true,
                    },
                  };
                }
                return l;
              }),
            }));
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "list_memberships",
        },
        (payload) => {
          const oldMembership = payload.old as MembershipRow;
          if (oldMembership) {
            const currentUserId = user?.user_id;
            if (currentUserId && oldMembership.user_id === currentUserId) {
              onDeleteList(oldMembership);
            } else {
              useTodoDataStore.setState((state) => ({
                lists: state.lists.map((l) => {
                  if (l.list_id === oldMembership.list_id) {
                    const currentNonOwnerCount = Math.max(
                      0,
                      (l.list.non_owner_count || 1) - 1
                    );
                    return {
                      ...l,
                      list: {
                        ...l.list,
                        non_owner_count: currentNonOwnerCount,
                        is_shared: currentNonOwnerCount > 0,
                      },
                    };
                  }
                  return l;
                }),
              }));
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "list_memberships",
        },
        (payload) => {
          const updatedMembership = payload.new as MembershipRow;
          if (updatedMembership?.list_id && isListDeleted(updatedMembership.list_id)) return;
          onUpdateMembership(updatedMembership);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lists",
        },
        (payload) => {
          const updatedList = payload.new as ListsRow;
          if (updatedList?.list_id && isListDeleted(updatedList.list_id)) return;
          onUpdateList(updatedList);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "lists",
        },
        (payload) => {
          const oldList = payload.old as { list_id: string };
          if (oldList?.list_id) {
            onDeleteList({ list_id: oldList.list_id });
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "list_folders",
        },
        async (payload) => {
          const newFolder = payload.new as any;
          if (user?.user_id && newFolder.user_id !== user.user_id) return;

          const exists = foldersRef.current.some(
            (f) => f.folder_id === newFolder.folder_id,
          );
          if (!exists) {
            const folderItem = {
              ...newFolder,
              memberships: [{ count: 0 }],
            };
            useTodoDataStore.setState((state) => ({
              folders: [...state.folders, folderItem],
            }));
            await saveSingleFolderToIndexedDB(folderItem);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "list_folders",
        },
        async (payload) => {
          const updatedFolder = payload.new as any;
          if (user?.user_id && updatedFolder.user_id !== user.user_id) return;

          useTodoDataStore.setState((state) => ({
            folders: state.folders.map((f) =>
              f.folder_id === updatedFolder.folder_id
                ? { ...f, ...updatedFolder }
                : f,
            ),
          }));
          const target = useTodoDataStore
            .getState()
            .folders.find((f) => f.folder_id === updatedFolder.folder_id);
          if (target) {
            await saveSingleFolderToIndexedDB(target);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "list_folders",
        },
        async (payload) => {
          const oldFolder = payload.old as any;
          if (oldFolder?.folder_id) {
            useTodoDataStore.setState((state) => ({
              folders: state.folders.filter(
                (f) => f.folder_id !== oldFolder.folder_id,
              ),
              lists: state.lists.map((l) =>
                l.folder === oldFolder.folder_id ? { ...l, folder: null } : l,
              ),
            }));
            await removeFolderFromIndexedDB(oldFolder.folder_id);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const raw = payload.new as any;
          if (!raw) return;
          const notificationId = raw.notification_id || raw.id;

          const incomingNotification: AppNotification = {
            notification_id: notificationId,
            type: raw.type,
            title: raw.title,
            content: raw.content,
            metadata: raw.metadata || {},
            is_global: raw.is_global ?? false,
            created_at: raw.created_at || new Date().toISOString(),
            read: false,
            deleted: false,
            read_at: null,
            deleted_at: null,
          };

          let finalNotification = incomingNotification;
          const needsEnrichment =
            raw.type === "list_invitation" &&
            !raw.metadata?.inviter_display_name &&
            !raw.metadata?.inviter_username;

          if (needsEnrichment) {
            try {
              const { notifications } = await getMyNotifications();
              if (notifications && notifications.length > 0) {
                useNotificationsStore.getState().setNotifications(notifications);
                const found = notifications.find(
                  (n) => n.notification_id === notificationId,
                );
                if (found) {
                  finalNotification = found;
                }
              } else {
                addNotificationToStore(incomingNotification);
              }
            } catch {
              addNotificationToStore(incomingNotification);
            }
          } else {
            addNotificationToStore(incomingNotification);
            getMyNotifications()
              .then(({ notifications }) => {
                if (notifications && notifications.length > 0) {
                  useNotificationsStore
                    .getState()
                    .setNotifications(notifications);
                }
              })
              .catch(() => { });
          }

          const display = getNotificationDisplay(finalNotification);
          customToast.info(display.title, display.content);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const raw = payload.old as any;
          const notificationId = raw?.notification_id || raw?.id;
          if (notificationId) {
            useNotificationsStore
              .getState()
              .removeNotificationFromStore(notificationId);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          onAddTask(payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          onUpdateTask(payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          onDeleteTask(payload.old as { task_id: string });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    supabase,
    onAddList,
    onUpdateMembership,
    onDeleteList,
    onUpdateList,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
    addNotificationToStore,
  ]);

  useEffect(() => {
    if (!user?.user_id) return;

    const presenceChannel = supabase.channel("online-presence", {
      config: {
        presence: {
          key: user.user_id,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const ids = new Set<string>();
        for (const key of Object.keys(state)) {
          ids.add(key);
        }
        setOnlineUserIds(ids);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key) addOnlineUser(key);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key) removeOnlineUser(key);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          if (user.show_activity_status !== false) {
            await presenceChannel.track({
              user_id: user.user_id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [
    user?.user_id,
    supabase,
    setOnlineUserIds,
    addOnlineUser,
    removeOnlineUser,
  ]);

  useEffect(() => {
    if (!user?.user_id) return;
    const channels = supabase.getChannels();
    const presenceChannel = channels.find(
      (ch) => ch.topic === "realtime:online-presence",
    );
    if (!presenceChannel) return;

    if (user.show_activity_status === false) {
      presenceChannel.untrack();
    } else {
      presenceChannel.track({
        user_id: user.user_id,
        online_at: new Date().toISOString(),
      });
    }
  }, [user?.show_activity_status, user?.user_id, supabase]);

  return null;
};
