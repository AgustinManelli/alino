"use client";
import { useState } from "react";

import { OauthButton } from "../oauth-button";
import { GithubIcon, GoogleIcon } from "@/components/ui/icons/icons";

import styles from "./AuthForm.module.css";

interface Props {
  title: React.ReactNode;
  description: React.ReactNode;
  topContent?: React.ReactNode;
  showOAuth?: boolean;
}

export const AuthForm = ({
  title,
  description,
  topContent,
  showOAuth = false,
}: Props) => {
  const [oauthPending, setOauthPending] = useState<boolean>(false);

  return (
    <article className={styles.authFormContainer}>
      <header className={styles.authFormHeader}>
        {topContent && (
          <div className={styles.authFormTopContent}>{topContent}</div>
        )}
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
                "--outauthHover": "rgb(230,230,230)",
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
                "--outauthHover": "#444444",
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
