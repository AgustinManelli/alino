"use client";

import styles from "./login.module.css";
import { AlinoLogo, ArrowLeft } from "../../components/icons";
import Link from "next/link";
import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

export default function AuthForms() {
  const [formType, setFormType] = useState<string>("login");

  const handleSetFormType = (type: string): void => {
    setFormType(type);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Link href="/">
          <div className={styles.backButton}>
            <ArrowLeft />
          </div>
        </Link>
        <AlinoLogo height="50px" />
        {formType === "login" ? (
          <LoginForm
            formType={formType}
            handleSetFormType={handleSetFormType}
          />
        ) : (
          <RegisterForm
            formType={formType}
            handleSetFormType={handleSetFormType}
          />
        )}
      </main>
    </div>
  );
}
