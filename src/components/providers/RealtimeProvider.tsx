"use client";

import { useEffect, useRef } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useTodoRealtime } from "@/hooks/todo/useTodoRealtime";
import { createClient } from "@/utils/supabase/client";
import { ListsRow, MembershipRow } from "@/lib/schemas/database.types";
import { Notification } from "@/lib/schemas/notification.types";
import { customToast } from "@/lib/toasts";

export const RealtimeProvider = () => {
  const supabase = createClient();

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

  return null;
};
