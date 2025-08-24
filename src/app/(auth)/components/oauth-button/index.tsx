"use client";

import { useState } from "react";

import { createClient } from "@/utils/supabase/client";
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
  const [isPending, setIsPending] = useState<boolean>(false);

  const login = async () => {
    setIsPending(true);
    setOauthPending(true);
    const href = window.location.origin;
    const { error } = await loginWithOauth(href, providerType);
    if (error) {
      setIsPending(false);
      setOauthPending(false);
      toast.error(error);
      return;
    }
  };

  return (
    <button
      className={styles.LoginOauth}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        login();
      }}
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
      {text && <p>Continuar con {providerName}</p>}
    </button>
  );
};

const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

const loginWithOauth = async (
  href: string,
  providerType: "google" | "github"
) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: providerType,
      options: {
        redirectTo: `${href}/auth/callback`,
      },
    });
    if (error) {
      throw new Error(
        "Error al iniciar sesión. Inténtalo nuevamente o contacta con soporte."
      );
    }
    return { error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};
