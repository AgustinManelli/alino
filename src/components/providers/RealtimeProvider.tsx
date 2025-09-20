"use client";

import { useEffect } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { createClient } from "@/utils/supabase/client";
import { ListsRow, MembershipRow } from "@/lib/schemas/database.types";

export const RealtimeProvider = () => {
  const supabase = createClient();

  const {
    getLists,
    subscriptionAddList,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionUpdateMembership,
  } = useTodoDataStore();

  useEffect(() => {
    const TABLE_NAME = "list_memberships";
    const store = useTodoDataStore.getState();

    const channel = supabase
      .channel("list-memberships")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLE_NAME,
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
          table: TABLE_NAME,
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
          table: TABLE_NAME,
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    supabase,
    subscriptionAddList,
    subscriptionUpdateMembership,
    subscriptionDeleteList,
  ]);

  return null;
};
