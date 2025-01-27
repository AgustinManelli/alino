"use client";

import { useEffect, useState } from "react";

import { useLists } from "@/store/useLists";
import { useLoaderStore } from "@/store/useLoaderStore";

import { Navbar } from "./navbar";

export default function NavbarComponent() {
  const [initialFetching, setInitialFetching] = useState<boolean>(true);

  const getLists = useLists((state) => state.getLists);
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
