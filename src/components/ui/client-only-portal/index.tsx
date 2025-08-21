"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface props {
  children: React.ReactNode;
}

export default function ClientOnlyPortal({ children }: props) {
  const ref = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.getElementById("portal-root");
    setMounted(true);
  }, []);

  return mounted && ref.current ? createPortal(children, ref.current) : null;
}
