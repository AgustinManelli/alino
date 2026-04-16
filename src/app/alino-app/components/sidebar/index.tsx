"use client";

import { useEffect, useRef } from "react";

import { useGetLists } from "@/hooks/todo/useGetLists";

import { Navbar } from "./Navbar";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@/components/ui/EmojiMart/apple.json";
init({ data });

export const Sidebar = () => {
  const executedRef = useRef(false);

  const { fetchLists } = useGetLists();

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchInitialData = async () => {
      await fetchLists();
    };
    fetchInitialData();
  }, []);

  return <Navbar />;
};
