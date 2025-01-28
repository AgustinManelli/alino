"use client";

import { useEffect, useState } from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useLoaderStore } from "@/store/useLoaderStore";

import { Navbar } from "./navbar";

export default function NavbarComponent() {
  const [initialFetching, setInitialFetching] = useState<boolean>(true);

  const getLists = useTodoDataStore((state) => state.getLists);
  const setLoading = useLoaderStore((state) => state.setLoading);

  useEffect(() => {
    const fetchTodos = async () => {
      setInitialFetching(true);
      await getLists();
      setInitialFetching(false);
    };
    fetchTodos();
    setLoading(false);
  }, []);

  return <Navbar initialFetching={initialFetching} />;
}
