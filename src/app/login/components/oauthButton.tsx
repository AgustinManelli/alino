"use client";
import { GithubIcon } from "@/lib/ui/icons";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import styles from "../login.module.css";
interface Provider {
  providerName: string;
  providerType: any;
  children?: string | JSX.Element | JSX.Element[] | null;
  style?: React.CSSProperties;
  text?: boolean | null;
}

export const OauthButton: React.FC<Provider> = ({
  providerName,
  providerType,
  children,
  style,
  text,
}) => {
  const handleSignIn = async () => {
    const supabase = await createClient();
    const href = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: providerType,
      options: {
        redirectTo: `${href}/auth/callback`,
      },
    });
    if (error) {
      toast.error("Hubo un error al iniciar sesión");
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
      {children}
      {text ? <p>Continue with {providerName}</p> : ""}
    </button>
  );
};
