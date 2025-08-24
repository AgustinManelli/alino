"use client";
import { useState } from "react";

import { OauthButton } from "../oauth-button";
import { GithubIcon, GoogleIcon } from "@/components/ui/icons/icons";

import styles from "./AuthForm.module.css";

interface Props {
  title: string;
  description: string;
  showOAuth?: boolean;
}

export const AuthForm = ({ title, description, showOAuth = false }: Props) => {
  const [oauthPending, setOauthPending] = useState<boolean>(false);

  return (
    <article className={styles.authFormContainer}>
      <header className={styles.authFormHeader}>
        <h1 className={styles.authFormTitle}>{title}</h1>
        <p className={styles.authFormDescription}>{description}</p>
      </header>

      {showOAuth && (
        <nav className={styles.authFormOAuthButtons}>
          <OauthButton
            providerName="Google"
            providerType="google"
            style={
              {
                color: "#1c1c1c",
                border: "1px solid rgb(245, 245, 245)",
                "--outauthBackground": "rgb(255,255,255)",
                "--outauthHover": "rgb(220,220,220)",
              } as React.CSSProperties
            }
            loadColor="#1c1c1c"
            oauthPending={oauthPending}
            setOauthPending={setOauthPending}
          >
            <GoogleIcon style={{ width: "25px" }} />
          </OauthButton>
          <OauthButton
            providerName="GitHub"
            providerType="github"
            style={
              {
                color: "#fff",
                border: "1px solid #1c1c1c",
                "--outauthBackground": "#1c1c1c",
                "--outauthHover": "#1c1c1c",
              } as React.CSSProperties
            }
            loadColor="#ffffff"
            oauthPending={oauthPending}
            setOauthPending={setOauthPending}
          >
            <GithubIcon style={{ width: "25px" }} />
          </OauthButton>
        </nav>
      )}
    </article>
  );
};
