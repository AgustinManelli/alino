"use client";

import { useEffect, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { Navbar } from "./navbar";

export default function NavbarComponent() {
  const [initialFetching, setInitialFetching] = useState<boolean>(true);

  const getLists = useTodoDataStore((state) => state.getLists);

  useEffect(() => {
    const fetchTodos = async () => {
      setInitialFetching(true);
      await getLists();
      setInitialFetching(false);
    };
    fetchTodos();
  }, []);

  return <Navbar initialFetching={initialFetching} />;
}
