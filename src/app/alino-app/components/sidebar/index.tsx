"use client";

import { useEffect, useRef, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Navbar } from "./navbar";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@/components/ui/emoji-mart/apple.json";
init({ data });

export const Sidebar = () => {
  const [initialFetching, setInitialFetching] = useState<boolean>(true);
  const executedRef = useRef(false);

  const getLists = useTodoDataStore((state) => state.getLists);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchInitialData = async () => {
      await getLists();
      setInitialFetching(false);
    };

    fetchInitialData();
  }, []);

  return <Navbar initialFetching={initialFetching} />;
};
