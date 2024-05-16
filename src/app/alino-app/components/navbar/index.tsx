"use client";

import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useLists } from "@/store/lists";
import { toast } from "sonner";
import { GetSubjects } from "@/lib/todo/actions";
import NavbarMobile from "./navbar-mobile";

export default function NavbarComponent() {
  const [isMobile, setIsMobile] = useState(false);

  const setLists = useLists((state) => state.setLists);
  const [initialFetching, setInitialFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchTodos = async () => {
      setInitialFetching(true);
      const { data: lists, error } = (await GetSubjects()) as any;
      if (error) toast(error);
      else setLists(lists);
      setInitialFetching(false);
    };
    fetchTodos();
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
        <NavbarMobile />
      ) : (
        <Navbar
          initialFetching={initialFetching}
          setInitialFetching={setInitialFetching}
        />
      )}
    </>
  );
}
