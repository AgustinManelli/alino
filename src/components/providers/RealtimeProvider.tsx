"use client";

import { useEffect, useRef } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useTodoRealtime } from "@/hooks/todo/useTodoRealtime";
import { createClient } from "@/utils/supabase/client";
import { ListsRow, MembershipRow } from "@/lib/schemas/database.types";
import { Notification } from "@/lib/schemas/notification.types";
import { customToast } from "@/lib/toasts";
import { useUserDataStore } from "@/store/useUserDataStore";
import { usePresenceStore } from "@/store/usePresenceStore";

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
          const exists = listsRef.current.some(
            (list) => list.list_id === newMembership.list_id,
          );
          if (!exists) onAddList(newMembership);
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
            onDeleteList(oldMembership);
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
          onUpdateList(updatedList);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          addNotificationToStore({
            ...newNotification,
            read: false,
            deleted: false,
          });
          customToast.info(newNotification.title || "Notificación");
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
