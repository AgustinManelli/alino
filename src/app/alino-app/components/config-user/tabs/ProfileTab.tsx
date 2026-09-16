"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WindowModal } from "@/components/ui/WindowModal";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { Edit } from "@/components/ui/icons/icons";
import { customToast } from "@/lib/toasts";
import { UserType } from "@/lib/schemas/database.types";
import { ProfileStats } from "@/lib/schemas/user.types";
import {
  AvatarSelector,
  AvatarSourceType,
} from "@/app/alino-app/components/initial-user-configuration/avatar-selector";
import { createClient } from "@/utils/supabase/client";
import styles from "../ConfigUser.module.css";

interface ProfileTabProps {
  user: UserType | null;
  profileStats: ProfileStats | null;
  uploadAvatar?: (formData: FormData) => Promise<{ error: string | null; data?: { avatar_url: string } }>;
  updateProfile: (updates: {
    display_name?: string;
    username?: string;
    biography?: string;
    avatar_url?: string;
  }) => Promise<{ error: string | null }>;
  onCropModalStateChange?: (isOpen: boolean) => void;
}

export function ProfileTab({
  user,
  profileStats,
  updateProfile,
  onCropModalStateChange,
}: ProfileTabProps) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatarType, setSelectedAvatarType] =
    useState<AvatarSourceType>("blobatar");
  const [variantSeed, setVariantSeed] = useState<number>(0);
  const [oauthAvatar, setOauthAvatar] = useState<string | null>(null);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const detectOAuthInfo = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!isMounted || !data.user) return;

        const meta = data.user.user_metadata;
        const provider =
          (data.user.app_metadata?.provider as string) ||
          data.user.app_metadata?.providers?.[0] ||
          null;

        const detectedAvatar =
          meta?.avatar_url ||
          meta?.picture ||
          null;

        if (detectedAvatar) {
          setOauthAvatar(detectedAvatar);
        }
        if (provider) {
          setOauthProvider(provider);
        }
      } catch {
        return;
      }
    };

    detectOAuthInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAvatarModal = useCallback(() => {
    const avatar = user?.avatar_url || "";
    if (avatar.startsWith("blobatar:")) {
      setSelectedAvatarType("blobatar");
      const seedPart = avatar.replace("blobatar:", "");
      const match = seedPart.match(/-(\d+)$/);
      if (match) {
        setVariantSeed(parseInt(match[1], 10));
      } else {
        setVariantSeed(0);
      }
    } else if (oauthAvatar && avatar === oauthAvatar) {
      setSelectedAvatarType("oauth");
    } else if (avatar && avatar !== "") {
      setSelectedAvatarType("custom");
      setCustomAvatar(avatar);
    } else {
      setSelectedAvatarType("default");
    }
    setIsAvatarModalOpen(true);
    onCropModalStateChange?.(true);
  }, [user?.avatar_url, oauthAvatar, onCropModalStateChange]);

  const handleCloseAvatarModal = useCallback(() => {
    setIsAvatarModalOpen(false);
    onCropModalStateChange?.(false);
  }, [onCropModalStateChange]);

  const getComputedAvatarUrl = useCallback(() => {
    const clean = user?.username?.trim().toLowerCase() || "alino";
    const effectiveSeed =
      variantSeed > 0 ? `${clean}-${variantSeed}` : clean;

    if (selectedAvatarType === "blobatar") {
      return `blobatar:${effectiveSeed}`;
    } else if (selectedAvatarType === "oauth") {
      return oauthAvatar || "";
    } else if (selectedAvatarType === "custom") {
      return customAvatar || "";
    } else if (selectedAvatarType === "default") {
      return "";
    }
    return "";
  }, [user?.username, variantSeed, selectedAvatarType, oauthAvatar, customAvatar]);

  const handleSaveAvatar = async () => {
    setIsSavingAvatar(true);
    try {
      const finalAvatarUrl = getComputedAvatarUrl();
      const res = await updateProfile({ avatar_url: finalAvatarUrl });
      if (res.error) throw new Error(res.error);

      customToast.success("Foto de perfil actualizada correctamente.");
      handleCloseAvatarModal();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la foto de perfil.";
      customToast.error(message);
    } finally {
      setIsSavingAvatar(false);
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

  return (
    <motion.div
      className={styles.tabContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <section className={styles.userHeaderSection}>
        <div
          className={styles.configUserIcon}
          onClick={handleOpenAvatarModal}
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          title="Personalizar foto de perfil"
        >
          <UserAvatar
            avatarUrl={user?.avatar_url}
            username={user?.username}
            size={96}
            style={{ borderRadius: "23px" }}
          />
          <button
            type="button"
            className={styles.configUserIconEditorButton}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAvatarModal();
            }}
            title="Personalizar foto de perfil"
            aria-label="Personalizar foto de perfil"
          >
            <Edit
              style={{
                stroke: "var(--text)",
                strokeWidth: "2",
                width: "16px",
                height: "16px",
                zIndex: 1,
              }}
            />
          </button>
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
            transition={{ delay: 0.1 }}
          >
            Plan {user?.tier ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1) : "Free"}
          </motion.div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <div className={styles.userEditorContainer}>
        <ProfileFieldEditor
          title="Nombre de visualización"
          currentValue={user?.display_name || ""}
          placeholder="Tu nombre completo o apodo"
          onSave={async (val) => {
            const res = await updateProfile({ display_name: val });
            return res.error;
          }}
          index={0}
        />

        <ProfileFieldEditor
          title="Nombre de usuario (@)"
          currentValue={user?.username || ""}
          placeholder="nuevo_usuario"
          note={`Te quedan ${profileStats?.remaining_changes ?? 2} cambios de usuario este mes. ${profileStats?.last_username_change
            ? `Último cambio: ${new Date(profileStats.last_username_change).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}`
            : ""
            }`}
          onSave={async (val) => {
            const res = await updateProfile({ username: val });
            return res.error;
          }}
          index={1}
        />

        <ProfileFieldEditor
          title="Biografía"
          currentValue={user?.biography || ""}
          placeholder="Cuéntanos un poco sobre ti..."
          isTextArea
          onSave={async (val) => {
            const res = await updateProfile({ biography: val });
            return res.error;
          }}
          index={2}
        />
      </div>

      <AnimatePresence mode="wait">
        {isAvatarModalOpen && (
          <WindowModal
            title="Personalizar foto de perfil"
            crossButton={false}
            closeAction={handleCloseAvatarModal}
          >
            <div className={styles.avatarModalContent}>
              <AvatarSelector
                username={user?.username || "usuario"}
                oauthAvatar={oauthAvatar}
                oauthProvider={oauthProvider}
                customAvatar={customAvatar}
                onCustomAvatarChange={(url) => setCustomAvatar(url)}
                selectedType={selectedAvatarType}
                onTypeChange={setSelectedAvatarType}
                variantSeed={variantSeed}
                onRandomizeVariant={() => setVariantSeed((prev) => prev + 1)}
              />

              <div className={styles.avatarModalActions}>
                <button
                  type="button"
                  className={styles.btnAction}
                  onClick={handleCloseAvatarModal}
                  disabled={isSavingAvatar}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${styles.btnAction} ${styles.btnPrimary}`}
                  onClick={handleSaveAvatar}
                  disabled={isSavingAvatar}
                >
                  {isSavingAvatar ? "Guardando..." : "Guardar foto"}
                </button>
              </div>
            </div>
          </WindowModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ProfileFieldEditorProps {
  title: string;
  currentValue: string;
  placeholder: string;
  note?: string;
  isTextArea?: boolean;
  onSave: (value: string) => Promise<string | null>;
  index: number;
}

function ProfileFieldEditor({
  title,
  currentValue,
  placeholder,
  note,
  isTextArea = false,
  onSave,
  index,
}: ProfileFieldEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (!isEditing) setValue(currentValue);
  }, [currentValue, isEditing]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (trimmed === currentValue.trim()) {
      setIsEditing(false);
      return;
    }

    if (!isTextArea && trimmed.length < 3) {
      customToast.error("El valor debe tener al menos 3 caracteres.");
      return;
    }

    setIsLoading(true);
    const error = await onSave(trimmed);
    if (error) {
      customToast.error(error);
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
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
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
                    maxLength={50}
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
                type="button"
              >
                Cancelar
              </button>
              <button
                className={`${styles.btnAction} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "..." : "Guardar"}
              </button>
            </>
          ) : (
            <button
              className={styles.btnAction}
              onClick={() => setIsEditing(true)}
              type="button"
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
}
