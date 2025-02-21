"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface props {
  children: React.ReactNode;
}

export default function ClientOnlyPortal({ children }: props) {
  const ref = useRef();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}
