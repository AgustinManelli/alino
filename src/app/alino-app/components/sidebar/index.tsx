"use client";

import { useEffect, useRef } from "react";

import { useGetLists } from "@/hooks/todo/useGetLists";

import { Navbar } from "./Navbar";

import { loadEmojiMartData } from "@/components/ui/EmojiMart/initEmojiMart";


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
    loadEmojiMartData();
  }, []);

  return <Navbar />;
};
