"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WindowComponent } from "@/components/ui/window-component";
import styles from "./ConfigUser.module.css";
import { Edit, UserIcon } from "@/components/ui/icons/icons";
import { useUserDataStore } from "@/store/useUserDataStore";
import { usePremiumModalStore } from "@/store/usePremiumModalStore";
import { toast } from "sonner";
import { getActiveSubscription, cancelSubscriptionAction } from "@/lib/api/user/actions";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";

export default function ConfigUser() {
  const [isUploading, setIsUploading] = useState(false);

  const user = useUserDataStore((state) => state.user);
  const profileStats = useUserDataStore((state) => state.profileStats);
  const setConfigUserActive = useUserDataStore(
    (state) => state.setConfigUserActive,
  );
  const fetchProfileStats = useUserDataStore(
    (state) => state.fetchProfileStats,
  );
  const uploadAvatar = useUserDataStore((state) => state.uploadAvatar);
  
  const openPremiumModal = usePremiumModalStore((state) => state.openPremiumModal);
  const openConfirmationModal = useConfirmationModalStore((state) => state.openModal);

  const isFreeTier = !user?.tier || user.tier === "free";

  const [activeSub, setActiveSub] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  useEffect(() => {
    fetchProfileStats();
  }, [fetchProfileStats]);

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
    openConfirmationModal({
      text: "¿Estás seguro de que deseas cancelar tu suscripción?",
      additionalText: "Podrás disfrutar los beneficios hasta el final de tu período actual de facturación.",
      actionButton: "Cancelar suscripción",
      onConfirm: async () => {
        setLoadingCancel(true);
        const { data, error } = await cancelSubscriptionAction();
        if (error) {
          toast.error(error);
        } else {
          toast.success(data);
          setActiveSub((prev: any) => prev ? { ...prev, cancel_at_period_end: true, status: 'canceled' } : null);
        }
        setLoadingCancel(false);
      }
    });
  };

  const closeConfigModal = () => {
    if (useConfirmationModalStore.getState().isOpen) return;
    
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

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await uploadAvatar(formData);
      if (res.error) throw new Error(res.error);
      toast.success("Foto de perfil actualizada correctamente.");
    } catch (error: any) {
      toast.error(error.message || "Error al subir la imagen.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
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

  const determineRingClass = (tier?: string) => {
    switch (tier) {
      case "pro":
        return styles.ringPro;
      case "student":
        return styles.ringStudent;
      default:
        return styles.ringFree;
    }
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
            className={`${styles.configUserIcon} ${determineRingClass(user?.tier)}`}
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
                    Más cambios de usuario, widgets y funciones pro.
                  </p>
                </div>
              </div>
              <button onClick={openPremiumModal} className={styles.upgradeBannerBtn}>
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
              style={{ background: 'var(--background-over-container)' }}
            >
              <div className={styles.upgradeBannerContent}>
                <span className={styles.upgradeEmoji}>✦</span>
                <div>
                  <p className={styles.upgradeBannerTitle}>
                    Suscripción {user?.tier?.toUpperCase()}
                  </p>
                  <p className={styles.upgradeBannerDesc} style={{ color: 'var(--text-not-available)', fontSize: '13px', marginTop: '2px' }}>
                    {loadingSub ? "Cargando info..." : (
                      activeSub?.gateway === 'promo' || activeSub?.gateway === 'manual'
                      ? `Termina el ${activeSub?.current_period_end ? new Date(activeSub.current_period_end).toLocaleDateString("es-AR") : ''}`
                      : activeSub?.cancel_at_period_end || activeSub?.status === 'canceled' || activeSub?.status === 'free'
                        ? `Se cancelará el ${activeSub?.current_period_end ? new Date(activeSub.current_period_end).toLocaleDateString("es-AR") : ''}`
                        : activeSub?.current_period_end 
                          ? `Renueva el ${new Date(activeSub.current_period_end).toLocaleDateString("es-AR")}`
                          : "Suscripción activa"
                    )}
                  </p>
                </div>
              </div>
              {activeSub && !activeSub.cancel_at_period_end && activeSub.status !== 'canceled' && activeSub.status !== 'free' && activeSub.gateway === 'mercadopago' && (
                <button 
                  onClick={handleCancelSub} 
                  className={styles.upgradeBannerBtn}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                  disabled={loadingCancel}
                >
                  {loadingCancel ? '...' : 'Cancelar'}
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
      </motion.div>
    </WindowComponent>
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
  const updateProfile = useUserDataStore((state) => state.updateProfile);

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
      toast.error("El valor debe tener al menos 3 caracteres.");
      return;
    }

    setIsLoading(true);
    const res = await updateProfile({ [dataKey]: trimmed });
    if (res.error) {
      toast.error(res.error);
      setValue(currentValue);
    } else {
      toast.success(`${title} actualizado con éxito.`);
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
