"use client";

import { useEffect, useRef, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Navbar } from "./navbar";

import { createClient } from "@/utils/supabase/client";

import { Database } from "@/lib/schemas/todo-schema";
type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@/components/ui/emoji-mart/apple.json";
init({ data });

export default function Sidebar() {
  const {
    lists,
    getLists,
    subscriptionAddList,
    subscriptionDeleteList,
    subscriptionUpdateList,
    subscriptionUpdateMembership,
  } = useTodoDataStore();
  const [initialFetching, setInitialFetching] = useState<boolean>(false);
  const executedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchTodos = async () => {
      setInitialFetching(true);
      await getLists();
      setInitialFetching(false);
    };

    fetchTodos();
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
          if (payload.eventType === "INSERT") {
            const newMembership = payload.new as MembershipRow;
            const listId = newMembership.list_id;

            if (!listId) return;

            const { data: listDetails, error } = await supabase
              .from("lists")
              .select("*")
              .eq("list_id", listId)
              .single();

            if (error) {
              console.error("Error fetching list details:", error);
              return;
            }

            const newItemForStore: ListsType = {
              ...newMembership,
              list: listDetails,
            };
            console.log(newItemForStore);
            subscriptionAddList(newItemForStore);
          }

          if (payload.eventType === "UPDATE") {
            console.log("Actualización de membresía recibida!", payload.new);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, subscriptionAddList, subscriptionDeleteList]);

  useEffect(() => {
    const channelLists = supabase
      .channel("lists")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lists",
        },
        (payload) => {
          console.log(
            "Actualización de detalles de lista recibida!",
            payload.new
          );
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
