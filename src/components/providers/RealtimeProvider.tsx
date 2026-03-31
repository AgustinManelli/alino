"use client";

import { useEffect } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { createClient } from "@/utils/supabase/client";
import {
  ListsRow,
  MembershipRow,
  TaskType,
} from "@/lib/schemas/database.types";
import { toast } from "sonner";

export const RealtimeProvider = () => {
  const supabase = createClient();

  const {
    subscriptionAddList,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionUpdateMembership,
    subscriptionAddTask,
    subscriptionUpdateTask,
    subscriptionDeleteTask,
  } = useTodoDataStore();

  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    const store = useTodoDataStore.getState();

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
          const exists = store.lists.some(
            (list) => list.list_id === newMembership.list_id
          );
          if (!exists) subscriptionAddList(newMembership);
        }
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
            subscriptionDeleteList(oldMembership);
          }
        }
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
          subscriptionUpdateMembership(updatedMembership);
        }
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
          subscriptionUpdateList(updatedList);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = payload.new as any;
          addNotification({
            ...newNotification,
            read: false,
            deleted: false,
          });
          toast.info(newNotification.title);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          subscriptionAddTask(payload.new as TaskType);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          subscriptionUpdateTask(payload.new as TaskType);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          subscriptionDeleteTask(payload.old as { task_id: string });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    supabase,
    subscriptionAddList,
    subscriptionUpdateMembership,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionAddTask,
    subscriptionUpdateTask,
    subscriptionDeleteTask,
    addNotification,
  ]);

  return null;
};
