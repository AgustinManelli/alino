"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { gaze, type Gaze } from "blobatar/gaze";
import Cropper, { Area, Point } from "react-easy-crop";

import "blobatar/motion.css";
import "blobatar/gaze.css";

import {
  idle,
  happy,
  wink,
  surprised,
  love,
  smug,
  unsure,
  thinking,
  type Expression,
} from "blobatar/expression";

import {
  GoogleIcon,
  GithubIcon,
  UserIcon,
  IAStars,
  DicesIcon,
  UploadIcon,
  Edit,
} from "@/components/ui/icons/icons";
import { Tabs, TabOption } from "@/components/ui/Tabs/Tabs";
import { WindowModal } from "@/components/ui/WindowModal";
import { getCroppedImg } from "@/lib/utils/imageCrop";
import { useUploadAvatar } from "@/hooks/user/useUploadAvatar";
import { customToast } from "@/lib/toasts";

import styles from "./AvatarSelector.module.css";

export type AvatarSourceType = "blobatar" | "oauth" | "custom" | "default";

interface Props {
  username: string;
  oauthAvatar: string | null;
  oauthProvider: string | null;
  customAvatar: string | null;
  onCustomAvatarChange: (url: string) => void;
  selectedType: AvatarSourceType;
  onTypeChange: (type: AvatarSourceType) => void;
  variantSeed: number;
  onRandomizeVariant: () => void;
}

export const AvatarSelector = ({
  username,
  oauthAvatar,
  oauthProvider,
  customAvatar,
  onCustomAvatarChange,
  selectedType,
  onTypeChange,
  variantSeed,
  onRandomizeVariant,
}: Props) => {
  const effectiveSeed = useMemo(() => {
    const clean = username.trim().toLowerCase() || "alino";
    return variantSeed > 0 ? `${clean}-${variantSeed}` : clean;
  }, [username, variantSeed]);

  const providerLabel = useMemo(() => {
    if (oauthProvider === "google") return "Google";
    if (oauthProvider === "github") return "GitHub";
    return "Cuenta";
  }, [oauthProvider]);

  const blobatarContainerRef = useRef<HTMLDivElement | null>(null);
  const gazeDriverRef = useRef<Gaze | null>(null);

  const attachGaze = useCallback(() => {
    const container = blobatarContainerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg || !(svg instanceof SVGSVGElement)) return;

    if (gazeDriverRef.current) {
      gazeDriverRef.current.stop();
      gazeDriverRef.current = null;
    }

    svg.style.setProperty("--mo-track-travel", "3.5px");
    const driver = gaze(svg, { target: "pointer" });
    gazeDriverRef.current = driver;
  }, []);

  const setBlobatarContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      blobatarContainerRef.current = node;
      if (node) {
        attachGaze();
        requestAnimationFrame(() => {
          attachGaze();
        });
      }
    },
    [attachGaze],
  );

  const [currentExpression, setCurrentExpression] = useState<Expression>(idle);
  const clickCountRef = useRef<number>(0);
  const expressionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const playfulExpressions = useMemo(
    () => [happy, wink, surprised, love, smug, unsure],
    [],
  );

  useEffect(() => {
    return () => {
      if (gazeDriverRef.current) {
        gazeDriverRef.current.stop();
        gazeDriverRef.current = null;
      }
      if (expressionTimerRef.current) {
        clearTimeout(expressionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedType !== "blobatar") {
      if (gazeDriverRef.current) {
        gazeDriverRef.current.stop();
        gazeDriverRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      attachGaze();
    }, 20);

    const raf = requestAnimationFrame(() => {
      attachGaze();
    });

    const container = blobatarContainerRef.current;
    let observer: MutationObserver | null = null;

    if (container) {
      observer = new MutationObserver(() => {
        attachGaze();
      });
      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [effectiveSeed, currentExpression, selectedType, attachGaze]);

  const handleAlinitoClick = () => {
    const nextExpr =
      playfulExpressions[clickCountRef.current % playfulExpressions.length];
    clickCountRef.current += 1;
    setCurrentExpression(nextExpr);

    if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current);
    expressionTimerRef.current = setTimeout(() => {
      setCurrentExpression(idle);
    }, 1400);
  };

  const handleRandomizeWithReaction = () => {
    setCurrentExpression(thinking);
    onRandomizeVariant();

    if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current);
    expressionTimerRef.current = setTimeout(() => {
      setCurrentExpression(happy);
      expressionTimerRef.current = setTimeout(() => {
        setCurrentExpression(idle);
      }, 1200);
    }, 400);
  };

  const { uploadAvatar } = useUploadAvatar();
  const [isUploading, setIsUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<Area | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleConfirmCrop = async () => {
    if (!imageToCrop || !completedCrop) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, completedCrop);
      if (!croppedBlob) throw new Error("Error al recortar la imagen.");

      const file = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadAvatar(formData);
      if (res.error) throw new Error(res.error);

      if (res.data?.avatar_url) {
        onCustomAvatarChange(res.data.avatar_url);
      }
      onTypeChange("custom");
      customToast.success("Foto de perfil subida correctamente.");
      setImageToCrop(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al subir la imagen.";
      customToast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const tabOptions: TabOption[] = useMemo(() => {
    const options: TabOption[] = [
      {
        id: "blobatar",
        label: "Alinito",
        icon: <IAStars style={{ width: "14px", height: "14px" }} />,
      },
    ];

    if (oauthAvatar) {
      options.push({
        id: "oauth",
        label: `Foto de ${providerLabel}`,
        icon:
          oauthProvider === "google" ? (
            <GoogleIcon style={{ width: "14px", height: "14px" }} />
          ) : oauthProvider === "github" ? (
            <GithubIcon
              style={{
                width: "14px",
                height: "14px",
                fill: "currentColor",
              }}
            />
          ) : (
            <UserIcon
              style={{
                width: "14px",
                height: "14px",
                stroke: "currentColor",
                strokeWidth: "1.5",
              }}
            />
          ),
      });
    }

    options.push({
      id: "custom",
      label: "Subir foto",
      icon: (
        <UploadIcon
          style={{
            width: "14px",
            height: "14px",
            stroke: "currentColor",
            strokeWidth: "1.5",
          }}
        />
      ),
    });

    options.push({
      id: "default",
      label: "Estándar",
      icon: (
        <UserIcon
          style={{
            width: "14px",
            height: "14px",
            stroke: "currentColor",
            strokeWidth: "1.5",
          }}
        />
      ),
    });

    return options;
  }, [oauthAvatar, oauthProvider, providerLabel]);

  return (
    <div className={styles.avatarSelectorContainer}>
      <div className={styles.previewWrapper}>
        <motion.div
          className={styles.avatarRing}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className={styles.avatarCircle}>
            <AnimatePresence mode="wait">
              {selectedType === "blobatar" && (
                <motion.div
                  ref={setBlobatarContainerRef}
                  key="blobatar"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleAlinitoClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92, rotate: [-2, 2, 0] }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  title="Haz clic en Alinito para interactuar"
                >
                  <Blobatar
                    name={effectiveSeed}
                    animate="always"
                    size={98}
                    expression={currentExpression}
                  />
                </motion.div>
              )}

              {selectedType === "oauth" && oauthAvatar && (
                <motion.div
                  key="oauth"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: "100%", height: "100%", position: "relative" }}
                >
                  <Image
                    src={oauthAvatar}
                    alt="Foto de perfil"
                    fill
                    unoptimized
                    className={styles.avatarImg}
                    style={{ objectFit: "cover" }}
                  />
                </motion.div>
              )}

              {selectedType === "custom" && (
                <motion.div
                  key="custom"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: "100%", height: "100%", position: "relative" }}
                >
                  {customAvatar ? (
                    <Image
                      src={customAvatar}
                      alt="Foto personalizada"
                      fill
                      unoptimized
                      className={styles.avatarImg}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <label className={styles.uploadTrigger}>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        title="Seleccionar foto de perfil"
                      />
                      <UploadIcon className={styles.uploadTriggerIcon} />
                      <span className={styles.uploadTriggerLabel}>
                        Elegir foto
                      </span>
                    </label>
                  )}
                </motion.div>
              )}

              {selectedType === "default" && (
                <motion.div
                  key="default"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--background-over-container)",
                  }}
                >
                  <UserIcon
                    style={{
                      width: "48%",
                      height: "48%",
                      stroke: "var(--icon-color)",
                      strokeWidth: "1.5",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedType === "blobatar" && (
            <motion.button
              type="button"
              className={styles.diceButton}
              onClick={handleRandomizeWithReaction}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              title="Generar estilo aleatorio para Alinito"
              aria-label="Generar estilo aleatorio"
            >
              <DicesIcon
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "var(--alino-secondary-color)",
                }}
              />
            </motion.button>
          )}

          {selectedType === "custom" && customAvatar && (
            <div
              className={styles.editCustomPhotoButton}
              title="Cambiar foto de perfil"
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileSelect}
                disabled={isUploading}
                title="Cambiar foto de perfil"
              />
              <Edit
                style={{
                  width: "14px",
                  height: "14px",
                  stroke: "var(--alino-secondary-color)",
                }}
              />
            </div>
          )}

          {selectedType === "oauth" && (
            <div
              className={styles.providerBadge}
              title={`Foto de ${providerLabel}`}
            >
              {oauthProvider === "google" && (
                <GoogleIcon style={{ width: "14px", height: "14px" }} />
              )}
              {oauthProvider === "github" && (
                <GithubIcon
                  style={{
                    width: "14px",
                    height: "14px",
                    fill: "var(--text)",
                  }}
                />
              )}
              {oauthProvider !== "google" && oauthProvider !== "github" && (
                <UserIcon
                  style={{
                    width: "14px",
                    height: "14px",
                    stroke: "var(--icon-color)",
                    strokeWidth: "1.5",
                  }}
                />
              )}
            </div>
          )}
        </motion.div>
      </div>

      <div className={styles.tabsWrapper}>
        <Tabs
          options={tabOptions}
          activeTab={selectedType}
          onChange={(id) => onTypeChange(id as AvatarSourceType)}
          layoutId="avatar-type-tabs"
        />
      </div>

      <AnimatePresence mode="wait">
        {imageToCrop && (
          <WindowModal
            title="Recortar imagen"
            crossButton={false}
            closeAction={() => setImageToCrop(null)}
          >
            <div className={styles.cropperModalWrapper}>
              <div className={styles.cropperContainer}>
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixelCrop) =>
                    setCompletedCrop(pixelCrop)
                  }
                />
              </div>

              <div className={styles.cropperControls}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-label="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.cropperActions}>
                  <button
                    className={styles.btnAction}
                    onClick={() => setImageToCrop(null)}
                    disabled={isUploading}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className={`${styles.btnAction} ${styles.btnPrimary}`}
                    onClick={handleConfirmCrop}
                    disabled={isUploading}
                    type="button"
                  >
                    {isUploading ? (
                      <>
                        <svg
                          className={styles.loaderIcon}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginRight: "6px" }}
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Subiendo...
                      </>
                    ) : (
                      "Guardar foto"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </WindowModal>
        )}
      </AnimatePresence>
    </div>
  );
};
