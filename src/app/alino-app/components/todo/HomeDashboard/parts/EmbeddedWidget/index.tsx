"use client";

import { useState } from "react";
import { LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./EmbeddedWidget.module.css";

interface Props {
  widget: {
    title: string;
    url: string | null;
  };
}

export const EmbeddedWidget = ({ widget }: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!widget.url) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>
          Este widget no tiene URL configurada.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loading && !error && (
        <div className={styles.loadingOverlay}>
          <LoadingIcon
            style={{
              width: "22px",
              height: "auto",
              stroke: "var(--text-not-available)",
              strokeWidth: "2.5",
            }}
          />
          <span>Cargando widget…</span>
        </div>
      )}
      {error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>
            No se pudo cargar el widget. Verifica la URL.
          </p>
          <p className={styles.errorUrl}>{widget.url}</p>
        </div>
      ) : (
        <iframe
          src={widget.url}
          title={widget.title}
          className={styles.iframe}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          sandbox="allow-scripts allow-same-origin allow-popups"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
};
