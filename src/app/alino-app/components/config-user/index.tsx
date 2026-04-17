"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WindowComponent } from "@/components/ui/window-component";
import styles from "./ConfigUser.module.css";
import { Edit, UserIcon } from "@/components/ui/icons/icons";
import { IAStars } from "@/components/ui/icons/icons";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useFetchProfileStats } from "@/hooks/user/useFetchProfileStats";
import { useFetchAIUsage } from "@/hooks/user/useFetchAIUsage";
import { useUploadAvatar } from "@/hooks/user/useUploadAvatar";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import {
  getActiveSubscription,
  cancelSubscriptionAction,
} from "@/lib/api/user/actions";
import { useModalStore } from "@/store/useModalStore";
import { WindowModal } from "@/components/ui/WindowModal";
import Cropper, { Area, Point } from "react-easy-crop";
import { getCroppedImg } from "@/lib/utils/imageCrop";
import { customToast } from "@/lib/toasts";

export default function ConfigUser() {
  const [isUploading, setIsUploading] = useState(false);
  const user = useUserDataStore((state) => state.user);
  const profileStats = useUserDataStore((state) => state.profileStats);
  const aiUsage = useUserDataStore((state) => state.aiUsage);
  const setConfigUserActive = useUserDataStore(
    (state) => state.setConfigUserActive,
  );
  const { fetchProfileStats } = useFetchProfileStats();
  const { fetchAIUsage } = useFetchAIUsage();
  const { uploadAvatar } = useUploadAvatar();
  const openModal = useModalStore((s) => s.open);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<Area | null>(null);

  const isFreeTier = !user?.tier || user.tier === "free";
  const [activeSub, setActiveSub] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  useEffect(() => {
    fetchProfileStats();
    fetchAIUsage();
  }, [fetchProfileStats, fetchAIUsage]);

  useEffect(() => {
    if (!isFreeTier) {
      setLoadingSub(true);
      getActiveSubscription().then((res) => {
        if (res.data) setActiveSub(res.data);
        setLoadingSub(false);
      });
    }
  }, [isFreeTier]);

  const handleCancelSub = async () => {
    openModal({
      type: "confirmation",
      props: {
        text: "¿Estás seguro de que deseas cancelar tu suscripción?",
        additionalText:
          "Podrás disfrutar los beneficios hasta el final de tu período actual de facturación.",
        actionButton: "Cancelar suscripción",
        onConfirm: async () => {
          setLoadingCancel(true);
          const { data, error } = await cancelSubscriptionAction();
          if (error) {
            customToast.error(error);
          } else {
            data && customToast.success(data);
            setActiveSub((prev: any) =>
              prev
                ? { ...prev, cancel_at_period_end: true, status: "canceled" }
                : null,
            );
          }
          setLoadingCancel(false);
        },
      },
    });
  };

  const closeConfigModal = () => {
    if (imageToCrop) return;
    if (useModalStore.getState().stack.length > 0) return;

    const confirmationModal = document.getElementById(
      "confirmation-modal-my-account-config-modal",
    );
    if (confirmationModal) return;
    setConfigUserActive(false);
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
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

      customToast.success("Foto de perfil actualizada correctamente.");
      setImageToCrop(null);
    } catch (error: any) {
      customToast.error(error.message || "Error al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const determineTierClass = (tier?: string) => {
    switch (tier) {
      case "pro":
        return styles.tierPro;
      case "student":
        return styles.tierStudent;
      default:
        return styles.tierFree;
    }
  };

  const handleOpenPremiumModal = () => {
    openModal({ type: "premium" });
  };

  return (
    <WindowComponent
      windowTitle={"Mi cuenta"}
      id={"list-config-section"}
      crossAction={closeConfigModal}
    >
      <motion.div
        className={styles.configModalContainer}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className={styles.userHeaderSection}>
          <div
            className={styles.configUserIcon}
            style={{
              backgroundImage: user?.avatar_url
                ? `url('${user.avatar_url}')`
                : "none",
            }}
          >
            {!user?.avatar_url && (
              <UserIcon
                style={{
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "1.5",
                  width: "60%",
                  height: "60%",
                }}
              />
            )}
            <div className={styles.configUserIconEditorButton}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                title="Cambiar foto de perfil"
              />
              {isUploading ? (
                <svg
                  className={styles.loaderIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <Edit
                  style={{
                    stroke: "var(--text)",
                    strokeWidth: "2",
                    width: "16px",
                    height: "16px",
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          </div>
          <div className={styles.userInfoContainer}>
            <h1 className={styles.displayName}>
              {user?.display_name || "Usuario"}
            </h1>
            <p className={styles.username}>@{user?.username || "usuario"}</p>
            <motion.div
              className={`${styles.tierBadge} ${determineTierClass(user?.tier)}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Plan {user?.tier || "Free"}
            </motion.div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {isFreeTier ? (
            <motion.div
              key="freebanner"
              className={styles.upgradeBanner}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.upgradeBannerContent}>
                <span className={styles.upgradeEmoji}>✦</span>
                <div>
                  <p className={styles.upgradeBannerTitle}>
                    Potenciá tu cuenta
                  </p>
                  <p className={styles.upgradeBannerDesc}>
                    Más tokens para IA, Widgets exclusivos y mucho más.
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenPremiumModal}
                className={styles.upgradeBannerBtn}
              >
                Ver planes
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="probanner"
              className={styles.upgradeBanner}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: 0.3 }}
              style={{ background: "var(--background-over-container)" }}
            >
              <div className={styles.upgradeBannerContent}>
                <span className={styles.upgradeEmoji}>✦</span>
                <div>
                  <p className={styles.upgradeBannerTitle}>
                    Suscripción {user?.tier?.toUpperCase()}
                  </p>
                  <p
                    className={styles.upgradeBannerDesc}
                    style={{
                      color: "var(--text-not-available)",
                      fontSize: "13px",
                      marginTop: "2px",
                    }}
                  >
                    {loadingSub
                      ? "Cargando info..."
                      : activeSub?.gateway === "promo" ||
                          activeSub?.gateway === "manual"
                        ? `Termina el ${activeSub?.current_period_end ? new Date(activeSub.current_period_end).toLocaleDateString("es-AR") : ""}`
                        : activeSub?.cancel_at_period_end ||
                            activeSub?.status === "canceled" ||
                            activeSub?.status === "free"
                          ? `Se cancelará el ${activeSub?.current_period_end ? new Date(activeSub.current_period_end).toLocaleDateString("es-AR") : ""}`
                          : activeSub?.current_period_end
                            ? `Renueva el ${new Date(activeSub.current_period_end).toLocaleDateString("es-AR")}`
                            : "Suscripción activa"}
                  </p>
                </div>
              </div>
              {activeSub &&
                !activeSub.cancel_at_period_end &&
                activeSub.status !== "canceled" &&
                activeSub.status !== "free" &&
                activeSub.gateway === "mercadopago" && (
                  <button
                    onClick={handleCancelSub}
                    className={styles.upgradeBannerBtn}
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                    disabled={loadingCancel}
                  >
                    {loadingCancel ? "..." : "Cancelar"}
                  </button>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.sectionDivider} />

        <div className={styles.userEditorContainer}>
          <EditionSection
            title={"Nombre de visualización"}
            dataKey={"display_name"}
            currentValue={user?.display_name || ""}
            placeholder="Tu nombre"
            index={0}
          />
          <EditionSection
            title={"Nombre de usuario (@)"}
            dataKey={"username"}
            currentValue={user?.username || ""}
            placeholder="nuevo_usuario"
            note={`Te quedan ${profileStats?.remaining_changes} cambios de usuario este mes. ${profileStats?.last_username_change ? `Último cambio: ${new Date(profileStats?.last_username_change).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}` : ""}`}
            index={1}
          />
          <EditionSection
            title={"Biografía"}
            dataKey={"biography"}
            currentValue={user?.biography || ""}
            placeholder="Cuéntanos un poco sobre ti..."
            isTextArea
            index={2}
          />
        </div>

        <div className={styles.sectionDivider} />

        <AICreditsSection aiUsage={aiUsage} userTier={user?.tier} index={3} />
      </motion.div>

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
                  onCropComplete={(_, pixelCrop) => setCompletedCrop(pixelCrop)}
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
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <div className={styles.cropperActions}>
                  <button
                    className={styles.btnAction}
                    onClick={() => setImageToCrop(null)}
                    disabled={isUploading}
                  >
                    Cancelar
                  </button>
                  <button
                    className={`${styles.btnAction} ${styles.btnPrimary}`}
                    onClick={handleConfirmCrop}
                    disabled={isUploading}
                  >
                    {isUploading ? "Subiendo..." : "Guardar foto"}
                  </button>
                </div>
              </div>
            </div>
          </WindowModal>
        )}
      </AnimatePresence>
    </WindowComponent>
  );
}

interface AICreditsProps {
  aiUsage: {
    used: number;
    limit: number;
    remaining: number;
    period_end: string;
    tier: string;
  } | null;
  userTier?: string;
  index: number;
}

function AICreditsSection({ aiUsage, userTier, index }: AICreditsProps) {
  const isUnlimited = aiUsage ? aiUsage.limit >= 9999999 : false;
  const usedPct =
    aiUsage && !isUnlimited
      ? Math.min((aiUsage.used / aiUsage.limit) * 100, 100)
      : 0;
  const remainingPct =
    aiUsage && !isUnlimited
      ? Math.max((aiUsage.remaining / aiUsage.limit) * 100, 0)
      : 0;

  const isNearLimit = usedPct >= 80 && !isUnlimited;
  const isExhausted = aiUsage ? aiUsage.remaining === 0 && !isUnlimited : false;

  const renewDate = aiUsage?.period_end
    ? new Date(aiUsage.period_end).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <motion.section
      className={styles.aiCreditsSection}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * (index + 3) }}
    >
      <div className={styles.aiCreditsSectionHeader}>
        <IAStars
          style={{
            width: "13px",
            height: "13px",
            stroke: "var(--icon-colorv2)",
            opacity: 0.6,
          }}
        />
        <h4 className={styles.aiCreditsSectionTitle}>
          Inteligencia Artificial
        </h4>
      </div>

      <div className={styles.aiCreditsCard}>
        <div className={styles.aiCreditsRow}>
          <div className={styles.aiCreditsInfo}>
            <span className={styles.aiCreditsLabel}>Créditos este período</span>
            {aiUsage ? (
              <span className={styles.aiCreditsCount}>
                {isUnlimited ? (
                  <span className={styles.aiCreditsUnlimited}>
                    Ilimitados ✦
                  </span>
                ) : (
                  <>
                    <span
                      className={styles.aiCreditsUsed}
                      style={{
                        color: isExhausted
                          ? "#ef4444"
                          : isNearLimit
                            ? "#f59e0b"
                            : "var(--text)",
                      }}
                    >
                      {aiUsage.remaining}
                    </span>
                    <span className={styles.aiCreditsTotal}>
                      {" "}
                      / {aiUsage.limit}
                    </span>
                  </>
                )}
              </span>
            ) : (
              <span className={styles.aiCreditsLoading}>Cargando...</span>
            )}
          </div>

          {renewDate && !isUnlimited && (
            <span className={styles.aiCreditsRenew}>
              Renueva el {renewDate}
            </span>
          )}
        </div>

        {!isUnlimited && aiUsage && (
          <div className={styles.aiCreditsBarTrack}>
            <motion.div
              className={styles.aiCreditsBarFill}
              initial={{ width: "100%" }}
              animate={{ width: `${remainingPct}%` }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.1 * (index + 3) + 0.2,
              }}
              style={{
                background: isExhausted
                  ? "rgba(239, 68, 68, 0.7)"
                  : isNearLimit
                    ? "linear-gradient(90deg, rgba(245, 158, 11, 0.8), rgba(239, 68, 68, 0.6))"
                    : "linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.6))",
              }}
            />
          </div>
        )}

        {isExhausted && (
          <p className={styles.aiCreditsWarning}>
            Sin créditos disponibles hasta la próxima renovación.
          </p>
        )}
        {isNearLimit && !isExhausted && (
          <p className={styles.aiCreditsWarning} style={{ color: "#f59e0b" }}>
            Quedan pocos créditos para este período.
          </p>
        )}

        {/* Costos de referencia */}
        {/* <div className={styles.aiCreditsCosts}>
          <span className={styles.aiCreditsCostItem}>
            Mejorar texto — {AI_CREDIT_COSTS.enhance} crédito
          </span>
          <span className={styles.aiCreditsCostDot}>·</span>
          <span className={styles.aiCreditsCostItem}>
            Generar tareas — {AI_CREDIT_COSTS.generateTasks} créditos
          </span>
        </div> */}
      </div>
    </motion.section>
  );
}

interface ESProps {
  title: string;
  dataKey: "display_name" | "username" | "biography" | "website_url";
  currentValue: string;
  placeholder: string;
  note?: string;
  isTextArea?: boolean;
  index: number;
}

const EditionSection = ({
  title,
  dataKey,
  currentValue,
  placeholder,
  note,
  isTextArea,
  index,
}: ESProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile } = useUpdateProfile();

  useEffect(() => {
    if (!isEditing) setValue(currentValue);
  }, [currentValue, isEditing]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (trimmed === currentValue.trim()) {
      setIsEditing(false);
      return;
    }
    if (
      dataKey !== "biography" &&
      dataKey !== "website_url" &&
      trimmed.length < 3
    ) {
      customToast.error("El valor debe tener al menos 3 caracteres.");
      return;
    }
    setIsLoading(true);
    const res = await updateProfile({ [dataKey]: trimmed });
    if (res.error) {
      customToast.error(res.error);
      setValue(currentValue);
    } else {
      customToast.success(`${title} actualizado con éxito.`);
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setValue(currentValue);
    setIsEditing(false);
  };

  return (
    <motion.section
      className={styles.editionSectionWrapper}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * (index + 3) }}
    >
      <div className={styles.editionContainer}>
        <div className={styles.editionInfo}>
          <h4>{title}</h4>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                style={{ width: "100%" }}
              >
                {isTextArea ? (
                  <textarea
                    className={styles.editionTextarea}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    autoFocus
                    maxLength={255}
                  />
                ) : (
                  <input
                    type="text"
                    className={styles.editionInput}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    autoFocus
                    maxLength={
                      dataKey === "username"
                        ? 30
                        : dataKey === "website_url"
                          ? 2048
                          : 50
                    }
                  />
                )}
              </motion.div>
            ) : (
              <motion.p
                key="static"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                {currentValue || (
                  <span style={{ opacity: 0.5 }}>{placeholder}</span>
                )}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.editionActions}>
          {isEditing ? (
            <>
              <button
                className={styles.btnAction}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                className={`${styles.btnAction} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "..." : "Guardar"}
              </button>
            </>
          ) : (
            <button
              className={styles.btnAction}
              onClick={() => setIsEditing(true)}
            >
              Editar
            </button>
          )}
        </div>
      </div>
      {note && isEditing && (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            fontSize: "12px",
            color: "var(--text-not-available)",
            paddingLeft: "18px",
          }}
        >
          {note}
        </motion.span>
      )}
    </motion.section>
  );
};
