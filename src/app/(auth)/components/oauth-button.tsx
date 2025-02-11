"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./OauthButton.module.css";
// import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface props {
  providerName: string;
  providerType: "google" | "github";
  children?: React.ReactNode;
  style?: React.CSSProperties;
  text?: boolean;
  loadColor?: string;
  disabled?: boolean;
  oauthPending: boolean;
  setOauthPending: (value: boolean) => void;
}

export function OauthButton({
  providerName,
  providerType,
  children,
  style,
  text = false,
  loadColor = "#1c1c1c",
  disabled = false,
  oauthPending,
  setOauthPending,
}: props) {
  const [isPending, setIsPending] = useState<boolean>(false);

  // const [popup, setPopup] = useState<Window | null>(null);
  // const router = useRouter();

  // useEffect(() => {
  //   if (!popup) return;

  //   const channel = new BroadcastChannel("popup-channel");
  //   channel.addEventListener("message", getDataFromPopup);

  //   const checkPopupClosed = setInterval(() => {
  //     if (popup.closed) {
  //       setPopup(null);
  //       setIsPending(false);
  //       setOauthPending(false);
  //       clearInterval(checkPopupClosed);
  //     }
  //   }, 500);

  //   return () => {
  //     clearInterval(checkPopupClosed);
  //     channel.removeEventListener("message", getDataFromPopup);
  //     setPopup(null);
  //     setIsPending(false);
  //     setOauthPending(false);
  //   };
  // }, [popup]);

  const login = async () => {
    setIsPending(true);
    setOauthPending(true);
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    const supabase = await createClient();
    const href = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: providerType,
      options: {
        redirectTo: `${href}/api/auth/callback`,
      },
    });
    if (error) {
      toast.error("Hubo un error al iniciar sesión");
      setIsPending(false);
      setOauthPending(false);
      return;
    }
    // if (isPWA) {
    //   const href = window.location.origin;
    //   const { error } = await supabase.auth.signInWithOAuth({
    //     provider: providerType,
    //     options: {
    //       redirectTo: `${href}/api/auth/callback`,
    //     },
    //   });
    //   if (error) {
    //     toast.error("Hubo un error al iniciar sesión");
    //     setIsPending(false);
    //     setOauthPending(false);
    //     return;
    //   }
    // } else {
    //   const origin = location.origin;
    //   const { data, error } = await supabase.auth.signInWithOAuth({
    //     provider: providerType,
    //     options: {
    //       redirectTo: `${origin}/api/auth/popup-callback`,
    //       queryParams: { prompt: "select_account" },
    //       skipBrowserRedirect: true,
    //     },
    //   });
    //   if (error || !data) {
    //     setIsPending(false);
    //     setOauthPending(false);
    //     return console.error(error);
    //   }
    //   const popup = openPopup(data.url);
    //   setPopup(popup);
    // }
  };

  // const openPopup = (url: string) => {
  //   const width = 500;
  //   const height = 600;
  //   const left = window.screen.width / 2 - width / 2;
  //   const top = window.screen.height / 2 - height / 2;

  //   const windowFeatures = `scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`;
  //   const popup = window.open(url, "popup", windowFeatures);

  //   if (!popup) {
  //     toast.error(
  //       "No se pudo abrir la ventana emergente. Revisa los bloqueadores de pop-ups."
  //     );
  //     return null;
  //   }

  //   return popup;
  // };

  // const getDataFromPopup = (e: MessageEvent) => {
  //   if (e.origin !== window.location.origin) return;

  //   const { authResultCode } = e.data as { authResultCode?: string };
  //   if (!authResultCode) return;

  //   setPopup(null);
  //   router.replace(`/api/auth/callback?code=${authResultCode}`);
  // };

  return (
    <button
      onClick={login}
      className={styles.LoginOauth}
      type="button"
      style={style}
      disabled={oauthPending || disabled}
    >
      {isPending ? (
        <LoadingIcon
          style={{
            width: "20px",
            height: "auto",
            stroke: `${loadColor}`,
            strokeWidth: "3",
          }}
        />
      ) : (
        children
      )}
      {text ? <p>Continue with {providerName}</p> : ""}
    </button>
  );
}
