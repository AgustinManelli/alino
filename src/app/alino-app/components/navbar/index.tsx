"use client";

import { useEffect, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Navbar } from "./navbar";

export default function NavbarComponent() {
  const [initialFetching, setInitialFetching] = useState<boolean>(false);

  useEffect(() => {
    const fetchTodos = async () => {
      setInitialFetching(true);
      await useTodoDataStore.getState().getLists();
      setInitialFetching(false);
    };
    fetchTodos();
  }, []);

  return <Navbar initialFetching={initialFetching} />;
}
