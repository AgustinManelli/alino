"use client";

import { useEffect, useRef, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Navbar } from "./navbar";

import { createClient } from "@/utils/supabase/client";

import { ListsType, ListsRow, MembershipRow } from "@/lib/schemas/todo-schema";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@/components/ui/emoji-mart/apple.json";
init({ data });

const supabase = createClient();

export default function Sidebar() {
  const {
    getLists,
    subscriptionAddList,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionUpdateMembership,
  } = useTodoDataStore();

  const [initialFetching, setInitialFetching] = useState<boolean>(true);
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchInitialData = async () => {
      await getLists();
      setInitialFetching(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const TABLE_NAME = "list_memberships";

    const channel = supabase
      .channel("list-memberships", { config: { broadcast: { self: false } } })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE_NAME,
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, subscriptionAddList, subscriptionDeleteList]);

  useEffect(() => {
    const channelLists = supabase
      .channel("lists", { config: { broadcast: { self: false } } })
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
      supabase.removeChannel(channelLists);
    };
  }, [supabase, subscriptionUpdateList]);

  return <Navbar initialFetching={initialFetching} />;
}
