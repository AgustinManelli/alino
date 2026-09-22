"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { WindowModal } from "@/components/ui/WindowModal";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { Edit } from "@/components/ui/icons/icons";
import { customToast } from "@/lib/toasts";
import { UserType, CosmeticItem } from "@/lib/schemas/database.types";
import { ProfileStats } from "@/lib/schemas/user.types";
import { LevelBadge, getLevelInfo } from "@/config/levelBadges";
import {
  getUserCosmeticsCatalogAction,
  equipCosmeticAction,
} from "@/lib/api/cosmetics/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import {
  AvatarSelector,
  AvatarSourceType,
} from "@/app/alino-app/components/initial-user-configuration/avatar-selector";
import { createClient } from "@/utils/supabase/client";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getCosmeticTranslation } from "@/lib/i18n/helpers";
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
  const { t, i18n } = useTranslation(["config", "cosmetics", "common"]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatarType, setSelectedAvatarType] =
    useState<AvatarSourceType>("blobatar");
  const [variantSeed, setVariantSeed] = useState<number>(0);
  const [oauthAvatar, setOauthAvatar] = useState<string | null>(null);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>([]);
  const [isLoadingCosmetics, setIsLoadingCosmetics] = useState(true);
  const [activeCosmeticTab, setActiveCosmeticTab] = useState<"frame" | "overlay">("frame");
  const [isEquipping, setIsEquipping] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getUserCosmeticsCatalogAction()
      .then((res) => {
        if (isMounted && res.data) {
          setCosmetics(res.data.cosmetics);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCosmetics(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEquipToggle = async (item: CosmeticItem | null, type?: "frame" | "overlay") => {
    if (isEquipping) return;
    setIsEquipping(true);

    const cosmeticType = item ? (item.type as "frame" | "overlay") : type!;
    const isCurrentlyEquipped = item ? item.is_equipped : false;
    const newEquippedId = isCurrentlyEquipped || !item ? null : item.id;

    try {
      const res = await equipCosmeticAction(newEquippedId, cosmeticType);
      if (res.success) {
        setCosmetics((prev) =>
          prev.map((c) => {
            if (c.type !== cosmeticType) return c;
            return {
              ...c,
              is_equipped: c.id === newEquippedId,
            };
          })
        );

        if (globalUserStore) {
          if (cosmeticType === "frame") {
            globalUserStore.getState().updateUser({ equipped_frame_id: newEquippedId });
          } else {
            globalUserStore.getState().updateUser({ equipped_overlay_id: newEquippedId });
          }
        }

        customToast.success(
          newEquippedId
            ? t("config:account.profile.cosmetics.equipSuccess")
            : t("config:account.profile.cosmetics.unequipSuccess")
        );
      } else {
        customToast.error(res.error || t("config:account.profile.cosmetics.updateError"));
      }
    } finally {
      setIsEquipping(false);
    }
  };

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

      customToast.success(t("config:account.profile.avatarModal.success"));
      handleCloseAvatarModal();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("config:account.profile.avatarModal.error");
      customToast.error(message);
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const determineTierClass = (tier?: string) => {
    switch (tier) {
      case "ultra":
        return styles.tierUltra;
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
          title={t("config:account.profile.avatarEditTitle")}
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
            title={t("config:account.profile.avatarEditTitle")}
            aria-label={t("config:account.profile.avatarEditTitle")}
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
            {user?.display_name || t("config:account.profile.defaultUser")}
          </h1>
          <p className={styles.username}>@{user?.username || "usuario"}</p>
          <div className={styles.levelDisplayRow}>
            <LevelBadge level={user?.level ?? 1} size={20} />
            <span className={styles.levelText}>
              {t("config:account.profile.levelText", {
                level: user?.level ?? 1,
                title: getLevelInfo(user?.level ?? 1).title,
              })}
            </span>
          </div>
          <motion.div
            className={`${styles.tierBadge} ${determineTierClass(user?.tier)}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {t("config:account.profile.tierPlan", {
              tier: user?.tier ? user.tier.charAt(0).toUpperCase() + user.tier.slice(1) : "Free",
            })}
          </motion.div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <div className={styles.userEditorContainer}>
        <ProfileFieldEditor
          title={t("config:account.profile.displayName.title")}
          currentValue={user?.display_name || ""}
          placeholder={t("config:account.profile.displayName.placeholder")}
          successMessage={t("config:account.profile.displayName.updated")}
          onSave={async (val) => {
            const res = await updateProfile({ display_name: val });
            return res.error;
          }}
          index={0}
        />

        <ProfileFieldEditor
          title={t("config:account.profile.username.title")}
          currentValue={user?.username || ""}
          placeholder={t("config:account.profile.username.placeholder")}
          successMessage={t("config:account.profile.username.updated")}
          note={`${t("config:account.profile.username.remainingChanges", {
            count: profileStats?.remaining_changes ?? 2,
          })} ${
            profileStats?.last_username_change
              ? t("config:account.profile.username.lastChange", {
                  date: new Date(profileStats.last_username_change).toLocaleDateString(
                    i18n.language === "en" ? "en-US" : "es-AR",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  ),
                })
              : ""
          }`}
          onSave={async (val) => {
            const res = await updateProfile({ username: val });
            return res.error;
          }}
          index={1}
        />

        <ProfileFieldEditor
          title={t("config:account.profile.biography.title")}
          currentValue={user?.biography || ""}
          placeholder={t("config:account.profile.biography.placeholder")}
          successMessage={t("config:account.profile.biography.updated")}
          isTextArea
          onSave={async (val) => {
            const res = await updateProfile({ biography: val });
            return res.error;
          }}
          index={2}
        />
      </div>

      <div className={styles.sectionDivider} />

      <section className={styles.cosmeticsSection}>
        <div className={styles.cosmeticsHeader}>
          <h2 className={styles.cosmeticsTitle}>
            {t("config:account.profile.cosmetics.title")}
          </h2>
          <p className={styles.cosmeticsSubtitle}>
            {t("config:account.profile.cosmetics.subtitle")}
          </p>
        </div>

        <div className={styles.cosmeticsTabs}>
          <Tabs
            options={[
              { id: "frame", label: t("config:account.profile.cosmetics.framesTab") },
              { id: "overlay", label: t("config:account.profile.cosmetics.overlaysTab") },
            ]}
            activeTab={activeCosmeticTab}
            onChange={(id) => setActiveCosmeticTab(id as "frame" | "overlay")}
            layoutId="profile-cosmetics-tabs"
          />
        </div>

        <div className={styles.cosmeticsGrid}>
          {isLoadingCosmetics ? (
            <>
              <Skeleton
                style={{
                  width: "100%",
                  height: "134px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-container-color)",
                }}
                delay={0}
              />
              <Skeleton
                style={{
                  width: "100%",
                  height: "134px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-container-color)",
                }}
                delay={0.15}
              />
              <Skeleton
                style={{
                  width: "100%",
                  height: "134px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-container-color)",
                }}
                delay={0.3}
              />
            </>
          ) : (
            (() => {
              const activeCosmetics = cosmetics.filter((c) => c.type === activeCosmeticTab);
              const isEquippedSlot =
                activeCosmeticTab === "frame"
                  ? !!user?.equipped_frame_id
                  : !!user?.equipped_overlay_id;

              return (
                <>
                  <div
                    className={`${styles.cosmeticCard} ${styles.cosmeticCardNone} ${!isEquippedSlot ? styles.cosmeticCardEquipped : ""
                      }`}
                    onClick={() => handleEquipToggle(null, activeCosmeticTab)}
                    title={t("config:account.profile.cosmetics.unequipTitle")}
                  >
                    <div className={styles.cosmeticPreviewWrap}>
                      <UserAvatar
                        avatarUrl={user?.avatar_url}
                        username={user?.username}
                        size={44}
                        style={{ borderRadius: "10px" }}
                        equippedFrameId={null}
                        equippedOverlayId={null}
                      />
                    </div>
                    <span className={styles.cosmeticName}>
                      {t("config:account.profile.cosmetics.none")}
                    </span>
                    <span
                      className={`${styles.cosmeticBadge} ${!isEquippedSlot ? styles.cosmeticBadgeEquipped : ""
                        }`}
                    >
                      {!isEquippedSlot
                        ? t("config:account.profile.cosmetics.active")
                        : t("config:account.profile.cosmetics.remove")}
                    </span>
                  </div>

                  {activeCosmetics.map((item) => {
                    const isProItem =
                      item.id === "overlay_pro_crown" ||
                      item.code === "overlay_pro_crown" ||
                      item.tier_required === "pro";
                    const trans = getCosmeticTranslation(item);

                    return (
                      <div
                        key={item.id}
                        className={`${styles.cosmeticCard} ${item.is_equipped ? styles.cosmeticCardEquipped : ""
                          }`}
                        onClick={() => handleEquipToggle(item)}
                        title={trans.description}
                      >
                        <div className={styles.cosmeticPreviewWrap}>
                          <UserAvatar
                            avatarUrl={user?.avatar_url}
                            username={user?.username}
                            size={44}
                            style={{ borderRadius: "10px" }}
                            equippedFrameId={item.type === "frame" ? item.id : null}
                            equippedOverlayId={item.type === "overlay" ? item.id : null}
                          />
                        </div>
                        <span className={styles.cosmeticName}>{trans.name}</span>
                        <span
                          className={`${styles.cosmeticBadge} ${item.is_equipped
                              ? styles.cosmeticBadgeEquipped
                              : isProItem
                                ? styles.cosmeticBadgePro
                                : ""
                            }`}
                        >
                          {item.is_equipped
                            ? t("config:account.profile.cosmetics.equipped")
                            : isProItem
                              ? t("config:account.profile.cosmetics.pro")
                              : t("config:account.profile.cosmetics.equip")}
                        </span>
                      </div>
                    );
                  })}
                </>
              );
            })()
          )}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {isAvatarModalOpen && (
          <WindowModal
            title={t("config:account.profile.avatarModal.title")}
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
                  {t("config:account.profile.avatarModal.cancel")}
                </button>
                <button
                  type="button"
                  className={`${styles.btnAction} ${styles.btnPrimary}`}
                  onClick={handleSaveAvatar}
                  disabled={isSavingAvatar}
                >
                  {isSavingAvatar
                    ? t("config:account.profile.avatarModal.saving")
                    : t("config:account.profile.avatarModal.save")}
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
  successMessage?: string;
  onSave: (value: string) => Promise<string | null>;
  index: number;
}

function ProfileFieldEditor({
  title,
  currentValue,
  placeholder,
  note,
  isTextArea = false,
  successMessage,
  onSave,
  index,
}: ProfileFieldEditorProps) {
  const { t } = useTranslation(["config", "common"]);
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
      customToast.error(t("config:account.profile.minCharsError"));
      return;
    }

    setIsLoading(true);
    const error = await onSave(trimmed);
    if (error) {
      customToast.error(error);
      setValue(currentValue);
    } else {
      customToast.success(
        successMessage || `${title} ${t("common:saved", { defaultValue: "actualizado con éxito." })}`
      );
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
                {t("config:account.profile.cancelBtn")}
              </button>
              <button
                className={`${styles.btnAction} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={isLoading}
                type="button"
              >
                {isLoading
                  ? t("config:account.profile.savingBtn")
                  : t("config:account.profile.saveBtn")}
              </button>
            </>
          ) : (
            <button
              className={styles.btnAction}
              onClick={() => setIsEditing(true)}
              type="button"
            >
              {t("config:account.profile.editBtn")}
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
