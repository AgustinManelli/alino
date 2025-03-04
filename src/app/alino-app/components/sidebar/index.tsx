"use client";

import { useEffect, useRef, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Navbar } from "./navbar";

//INIT EMOJI-MART
import { init } from "emoji-mart";
import data from "@/components/ui/emoji-mart/apple.json";
init({ data });

export default function Sidebar() {
  const getLists = useTodoDataStore((state) => state.getLists);
  const [initialFetching, setInitialFetching] = useState<boolean>(false);
  const executedRef = useRef(false);

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

  return <Navbar initialFetching={initialFetching} />;
}
