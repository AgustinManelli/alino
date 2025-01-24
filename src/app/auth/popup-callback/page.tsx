"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

const PopupCallback = () => {
  const [mounted, setMounted] = useState(false);
  const params = useSearchParams();
  const code = params?.get("code");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!code) return;
    // Send the code to the parent window
    const channel = new BroadcastChannel("popup-channel");
    channel.postMessage({ authResultCode: code });
    window.close();
  }, []);

  if (!mounted) return null;

  // Close the popup if there is no code
  if (!code) {
    window.close();
  }

  return null;
};

// export default PopupCallback;

export default function Page() {
  return (
    <Suspense>
      <PopupCallback />
    </Suspense>
  );
}
