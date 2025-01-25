"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { LoadingIcon } from "@/lib/ui/icons";
import styles from "../login.module.css";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface props {
  providerName: string;
  providerType: any;
  children?: string | JSX.Element | JSX.Element[] | null;
  style?: React.CSSProperties;
  text?: boolean | null;
  loadColor: string;
}

export function OauthButton({
  providerName,
  providerType,
  children,
  style,
  text,
  loadColor,
}: props) {
  const [isPending, setIsPending] = useState<boolean>(false);

  // const handleSignIn = async () => {
  //   setIsPending(true);
  //   const supabase = await createClient();
  //   const href = window.location.origin;
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: providerType,
  //     options: {
  //       redirectTo: `${href}/auth/callback`,
  //       // skipBrowserRedirect: true,
  //     },
  //   });
  //   if (error) {
  //     toast.error("Hubo un error al iniciar sesión");
  //     setIsPending(false);
  //     return;
  //   }
  // };

  const [popup, setPopup] = useState<Window | null>(null);
  const router = useRouter();

  useEffect(() => {
    // If there is no popup, nothing to do
    if (!popup) return;

    // Listen for messages from the popup by creating a BroadcastChannel
    const channel = new BroadcastChannel("popup-channel");
    channel.addEventListener("message", getDataFromPopup);

    // effect cleaner (when component unmount)
    return () => {
      channel.removeEventListener("message", getDataFromPopup);
      setPopup(null);
      setIsPending(false);
    };
  }, [popup]);

  const login = async () => {
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    if (isPWA) {
      const supabase = await createClient();
      const href = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerType,
        options: {
          redirectTo: `${href}/auth/callback`,
        },
      });
      if (error) {
        toast.error("Hubo un error al iniciar sesión");
        setIsPending(false);
        return;
      }
    } else {
      const supabase = createClient();
      const origin = location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerType,
        options: {
          redirectTo: `${origin}/auth/popup-callback`,
          queryParams: { prompt: "select_account" },
          skipBrowserRedirect: true,
        },
      });
      if (error || !data) {
        return console.error(error);
      }
      const popup = openPopup(data.url);
      setPopup(popup);
    }
  };

  const openPopup = (url: string) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // window features for popup
    const windowFeatures = `scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`;
    const popup = window.open(url, "popup", windowFeatures);
    return popup;
  };

  const getDataFromPopup = (e: any) => {
    // check origin
    if (e.origin !== window.location.origin) return;

    // get authResultCode from popup
    const code = e.data?.authResultCode;
    if (!code) return;

    // clear popup and replace the route
    setPopup(null);
    router.replace(`auth/callback?code=${code}`);
  };

  return (
    <button
      onClick={login}
      className={styles.LoginOauth}
      type="button"
      style={style}
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
