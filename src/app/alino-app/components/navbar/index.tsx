"use client";

import { useEffect, useState } from "react";
import { useLists } from "@/store/lists";
import { toast } from "sonner";
import { GetLists } from "@/lib/todo/actions";
import Navbar from "./navbarDesktop";
import NavbarMobile from "./navbarMobile";
import { useLoaderStore } from "@/store/useLoaderStore";
import useMobileStore from "@/store/useMobileStore";

export default function NavbarComponent() {
  const { isMobile, setIsMobile } = useMobileStore();

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 850);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile ? (
        <NavbarMobile
          initialFetching={initialFetching}
          setInitialFetching={setInitialFetching}
        />
      ) : (
        <Navbar initialFetching={initialFetching} />
      )}
    </>
  );
}
