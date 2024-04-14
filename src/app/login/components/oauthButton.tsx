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
}

export const OauthButton: React.FC<Provider> = ({
  providerName,
  providerType,
  children,
  style,
}) => {
  const handleSignIn = async () => {
    const supabase = await createClient();
    const href = window.location.origin;
    const git = providerType;
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
    // toast.success(`Sesión iniciada con ${providerName} correctamente`);
  };
  return (
    <button
      onClick={handleSignIn}
      className={styles.LoginOauth}
      type="button"
      style={style}
    >
      {children}
      <p>Continue with {providerName}</p>
    </button>
  );
};
