import Link from "next/link";
import { motion } from "framer-motion";
import { UseFormRegister, FieldErrors } from "react-hook-form";

import { OauthButton } from "./oauth-button";
import {
  GithubIcon,
  GoogleIcon,
  LoadingIcon,
} from "@/components/ui/icons/icons";

import styles from "./AuthForm.module.css";
import { useState } from "react";

interface AuthFormProps {
  title: string;
  description: string;
  fields: Array<{
    name: string;
    type: string;
    placeholder: string;
    required?: boolean;
  }>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isPending: boolean;
  submitButtonText: string;
  showOAuth?: boolean;
  footerLinks: Array<{ text: string; href: string }>;
}

export function AuthForm({
  title,
  description,
  fields,
  onSubmit,
  register,
  errors,
  isPending,
  submitButtonText,
  showOAuth = false,
  footerLinks,
}: AuthFormProps) {
  const [oauthPending, setOauthPending] = useState<boolean>(false);
  return (
    <motion.article
      transition={{ duration: 1 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.authFormContainer}
    >
      <header className={styles.authFormHeader}>
        <h1 className={styles.authFormTitle}>{title}</h1>
        <p className={styles.authFormDescription}>{description}</p>
      </header>

      <form className={styles.authForm} onSubmit={onSubmit}>
        <div className={styles.authFormFields}>
          {fields.map((field) => (
            <div key={field.name} className={styles.authFormFieldGroup}>
              {errors[field.name] && (
                <motion.p
                  className={styles.authFormErrorMessage}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, height: "0px" }}
                  animate={{ opacity: 1, height: "initial" }}
                  exit={{ opacity: 0, height: "0px" }}
                >
                  {errors[field.name]?.message as string}
                </motion.p>
              )}

              <input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className={styles.authFormInput}
                {...register(field.name)}
                required={field.required ?? true}
                disabled={isPending || oauthPending}
              />
            </div>
          ))}
        </div>

        <div className={styles.authFormActions}>
          <button
            className={styles.authFormButton}
            type="submit"
            disabled={isPending || oauthPending}
          >
            {isPending && (
              <LoadingIcon
                style={{
                  width: "20px",
                  height: "auto",
                  stroke: "#fff",
                  strokeWidth: "3",
                }}
              />
            )}
            <span>{submitButtonText}</span>
          </button>

          {showOAuth && (
            <nav className={styles.authFormOAuthButtons}>
              <OauthButton
                providerName="Github"
                providerType="github"
                style={{ backgroundColor: "#1c1c1c", color: "#fff" }}
                loadColor="#ffffff"
                disabled={isPending}
                oauthPending={oauthPending}
                setOauthPending={setOauthPending}
              >
                <GithubIcon style={{ width: "25px" }} />
              </OauthButton>
              <OauthButton
                providerName="Google"
                providerType="google"
                style={{ backgroundColor: "#fff", color: "#1c1c1c" }}
                loadColor="#1c1c1c"
                disabled={isPending}
                oauthPending={oauthPending}
                setOauthPending={setOauthPending}
              >
                <GoogleIcon style={{ width: "25px" }} />
              </OauthButton>
            </nav>
          )}
        </div>
      </form>

      <footer className={styles.authFormFooter}>
        {footerLinks.map((link, index) => (
          <Link
            key={index}
            className={styles.authFormFooterLink}
            href={link.href}
          >
            {link.text}
          </Link>
        ))}
      </footer>
    </motion.article>
  );
}
