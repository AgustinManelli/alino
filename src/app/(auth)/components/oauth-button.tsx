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

  const login = async () => {
    setIsPending(true);
    setOauthPending(true);
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
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
      setOauthPending(false);
      return;
    }
  };

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
      {text ? <p>Continuar con {providerName}</p> : ""}
    </button>
  );
}
