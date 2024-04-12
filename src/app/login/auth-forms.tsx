"use client";

import styles from "./login.module.css";
import { AlinoLogo, HomeIcon } from "../../lib/ui/icons";
import { useState } from "react";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { ButtonComponent } from "@/components/buttonComponent/buttonComponent";
import { ResetForm } from "./components/resetPassword-form";

export default function AuthForms() {
  const [formType, setFormType] = useState<string>("login");

  const handleSetFormType = (type: string): void => {
    setFormType(type);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.backButton}>
          <ButtonComponent
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="/"
            strokeBorder={false}
          >
            <HomeIcon
              style={{
                strokeWidth: "2",
                stroke: "#1c1c1c",
                width: "25px",
                height: "auto",
                fill: "none",
              }}
            />
          </ButtonComponent>
        </div>
        <AlinoLogo height="50px" />
        {formType === "login" ? (
          <LoginForm
            formType={formType}
            handleSetFormType={handleSetFormType}
          />
        ) : formType === "signup" ? (
          <RegisterForm
            formType={formType}
            handleSetFormType={handleSetFormType}
          />
        ) : (
          <ResetForm
            formType={formType}
            handleSetFormType={handleSetFormType}
          />
        )}
      </main>
    </div>
  );
}
