"use client";

import { useState } from "react";

import { loginWithOAuth } from "@/lib/api/auth/client-actions";

import { LoadingIcon } from "@/components/ui/icons/icons";

import styles from "./OauthButton.module.css";
import { toast } from "sonner";

interface Props {
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

export const OauthButton = ({
  providerName,
  providerType,
  children,
  style,
  text = true,
  loadColor = "#1c1c1c",
  disabled = false,
  oauthPending,
  setOauthPending,
}: Props) => {
  const [isLocalPending, setIsLocalPending] = useState<boolean>(false);

  const handleLogin = async () => {
    setIsLocalPending(true);
    setOauthPending(true);

    const origin = window.location.origin;
    const { error } = await loginWithOAuth(providerType, origin);

    if (error) {
      setIsLocalPending(false);
      setOauthPending(false);
      toast.error(error);
    }
  };

  return (
    <button
      className={styles.LoginOauth}
      type="button"
      onClick={handleLogin}
      style={style}
      disabled={oauthPending || disabled}
    >
      {isLocalPending ? (
        <LoadingIcon
          style={{
            width: "25px",
            height: "auto",
            stroke: `${loadColor}`,
            strokeWidth: "3",
            transform: "scale(0.7)",
          }}
        />
      ) : (
        children
      )}
      {text && <p>Continuar con {providerName}</p>}
    </button>
  );
};
