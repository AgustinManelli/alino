"use client";

import { useEffect, useRef, useState } from "react";

import { toPng } from "html-to-image";

import { AlinoLogo, LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./ShareableQRCard.module.css";

interface Props {
  qrDataUrl: string;
  roleLabel: string;
  roleColor: string;
  onImageGenerated?: (url: string, blob: Blob | null) => void;
}

export function ShareableQrCard({
  qrDataUrl,
  roleLabel,
  roleColor,
  onImageGenerated,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!qrDataUrl || !cardRef.current || imageUrl) return;

    let isMounted = true;

    const timer = setTimeout(async () => {
      try {
        if (!cardRef.current) return;

        const dataUrl = await toPng(cardRef.current, {
          quality: 1,
          pixelRatio: 3,
          style: { transform: "scale(1)", margin: "0" },
        });

        if (isMounted) {
          setImageUrl(dataUrl);

          if (onImageGenerated) {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            onImageGenerated(dataUrl, blob);
          }
        }
      } catch (error) {
        console.error("Error al generar imagen de la tarjeta modal:", error);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [qrDataUrl, imageUrl, onImageGenerated]);

  return (
    <>
      <div style={{ position: "fixed", top: -9999, left: -9999 }}>
        <div ref={cardRef} className={styles.card}>
          <div className={styles.panelBgOne} />
          <div className={styles.panelBgTwo} />
          <AlinoLogo
            style={{
              width: "30px",
              height: "auto",
              position: "absolute",
              top: 20,
              right: 20,
              opacity: 0.1,
              fill: "rgb(28, 28, 28)",
            }}
          />
          <h2 className={styles.title}>¡Únete a mi lista!</h2>
          <p className={styles.description}>
            Escanea este código QR con la cámara de tu teléfono para acceder.
          </p>

          <div className={styles.qrWrapper}>
            <img src={qrDataUrl} alt="QR" />
          </div>

          <div className={styles.roleBadge}>
            Te unirás como{" "}
            <span style={{ color: roleColor, fontWeight: 700 }}>
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="QR de invitación compartible"
          className={styles.finalImage}
        />
      ) : (
        <div className={styles.generatingPlaceholder}>
          <LoadingIcon className={styles.loadingIcon} />
        </div>
      )}
    </>
  );
}
