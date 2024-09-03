"use client";

import { useEffect, useState } from "react";
import { useLists } from "@/store/lists";
import Navbar from "./navbarDesktop";
import { useLoaderStore } from "@/store/useLoaderStore";

export default function NavbarComponent() {
  const getLists = useLists((state) => state.getLists);
  const [initialFetching, setInitialFetching] = useState<boolean>(true);
  const setLoading = useLoaderStore((state) => state.setLoading);

  useEffect(() => {
    const fetchTodos = async () => {
      setInitialFetching(true);
      getLists();
      setInitialFetching(false);
    };
    fetchTodos();
    setLoading(false);
    document.body.style.overflow = "";
  }, []);

  return <Navbar initialFetching={initialFetching} />;
}
