"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import styles from "../login.module.css";
import { LoadingIcon } from "@/lib/ui/icons";
import { useState } from "react";

interface Provider {
  providerName: string;
  providerType: any;
  children?: string | JSX.Element | JSX.Element[] | null;
  style?: React.CSSProperties;
  text?: boolean | null;
  loadColor: string;
}

export const OauthButton: React.FC<Provider> = ({
  providerName,
  providerType,
  children,
  style,
  text,
  loadColor,
}) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const handleSignIn = async () => {
    setIsPending(true);
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
  };
  return (
    <button
      onClick={handleSignIn}
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
};
