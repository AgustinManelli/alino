"use client";

import { useEffect } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { createClient } from "@/utils/supabase/client";
import { ListsRow, MembershipRow, ListsType } from "@/lib/schemas/todo-schema";

const supabase = createClient();

export const RealtimeProvider = () => {
  const {
    subscriptionAddList,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionUpdateMembership,
  } = useTodoDataStore();

  useEffect(() => {
    const channelMemberships = supabase
      .channel("list-memberships-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "list_memberships",
        },
        async (payload) => {
          if (payload.eventType === "UPDATE") {
            const updatedMembership = payload.new as MembershipRow;
            subscriptionUpdateMembership(updatedMembership);
          }

          if (payload.eventType === "DELETE") {
            const oldMembership = payload.old as MembershipRow;
            if (oldMembership) {
              subscriptionDeleteList(oldMembership);
            }
          }
        }
      )
      .on("broadcast", { event: "membership_insert" }, (payload) => {
        const sent = (payload as any).payload;
        if (!sent) return;

        const membership = sent.membership as MembershipRow;
        const list = sent.list as ListsRow;

        if (!membership) return;

        const newItemForStore: ListsType = {
          ...membership,
          list: list,
        };

        subscriptionAddList(newItemForStore);
      })
      .subscribe();

    const channelLists = supabase
      .channel("lists-realtime")
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
      supabase.removeChannel(channelMemberships);
      supabase.removeChannel(channelLists);
    };
  }, [
    subscriptionAddList,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionUpdateMembership,
  ]);

  return null;
};
