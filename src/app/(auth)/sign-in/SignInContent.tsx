"use client";

import { IAStarsLoader } from "@/components/ui/icons/ia-loader";
import { AuthForm } from "../components/auth-form";
import styles from "./SignIn.module.css";

export function SignInContent() {
  return (
    <AuthForm
      topContent={
        <div className={styles.iaBadgeContainer}>
          <IAStarsLoader
            size={12}
            color="#e2a5ff"
            duration={2}
            title="Cargando IA"
            strokeWidth={1}
          />
          <h3 className={styles.title}>Impulsado con IA</h3>
        </div>
      }
      title="Iniciar sesión en Alino"
      description="Simplifica tu forma de organizarte."
      showOAuth={true}
    />
  );
}
