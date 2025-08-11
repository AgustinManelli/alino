"use client";

import React, { useEffect, useState } from "react";
import styles from "./UsernameInput.module.css";
import { LoadingIcon } from "@/components/ui/icons/icons";
import { motion } from "motion/react";

type Props = {
  initialValue?: string;
  onSubmit?: (username: string) => Promise<string | null>;
  placeholder?: string;
  disabled?: boolean;
};

export default function UsernameInput({
  initialValue = "",
  onSubmit,
  placeholder = "Elige un nombre de usuario",
  disabled = false,
}: Props) {
  const [username, setUsername] = useState<string>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsername(initialValue);
  }, [initialValue]);

  const validate = (value: string) => {
    const v = value.trim().toLowerCase();
    return /^[a-z0-9_]{3,30}$/.test(v);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleaned = username.trim().toLowerCase();
    if (!validate(cleaned)) {
      setError("El nombre de usuario debe tener 3-30 caracteres: a-z, 0-9 y _");
      return;
    }
    setLoading(true);
    if (onSubmit) {
      const error = await onSubmit(cleaned);
      setError(error);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!disabled && !loading) handleSubmit();
    }
  };

  return (
    <form
      className={styles.alinoUsernameInputWrapper}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div className={styles.container}>
        <div
          className={styles.alinoUsernameInput}
          role="group"
          aria-labelledby="username-label"
        >
          <span className={styles.alinoAt} aria-hidden>
            @
          </span>
          <input
            className={styles.alinoInputField}
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? "username-error" : undefined}
            disabled={disabled || loading}
            inputMode="text"
            autoComplete="username"
          />
        </div>

        <button
          type="submit"
          className={styles.alinoSubmitBtn}
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          disabled={disabled || loading}
          aria-disabled={disabled || loading}
        >
          {loading ? (
            <LoadingIcon
              style={{
                width: "20px",
                height: "auto",
                stroke: `white`,
                strokeWidth: "3",
              }}
            />
          ) : (
            "Siguiente"
          )}
        </button>
      </div>
      {error && (
        <motion.div
          id="username-error"
          className={styles.alinoError}
          role="alert"
          initial={{ height: "0px" }}
          animate={{ height: "initial" }}
          exit={{ height: "0px" }}
        >
          {error}
        </motion.div>
      )}
    </form>
  );
}

/*
Example usage:

import UsernameInput from './UsernameInput';

export default function Page(){
  const handle = async (u: string) => {
    // call supabase or your endpoint
    await fetch('/api/user/set-username', { method: 'POST', body: JSON.stringify({ username: u }) });
  }

  return <UsernameInput onSubmit={handle} />
}
*/
