"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/shallow";
import { Blobatar } from "@blobatar/react";
import { happy, wink, love, type Expression } from "blobatar/expression";
import "blobatar/motion.css";

import { useUserDataStore } from "@/store/useUserDataStore";
import { useSetUsernameFirstTime } from "@/hooks/user/useSetUsernameFirstTime";
import { createClient } from "@/utils/supabase/client";
import {
  searchUsers,
  saveUserOnboardingSurvey,
  applyReferralCodeAction,
} from "@/lib/api/user/actions";
import { clearStoredReferralCode } from "@/lib/utils/referral";

import { UsernameInput } from "./username-input";
import { AvatarSelector, AvatarSourceType } from "./avatar-selector";
import {
  OnboardingPreferencesStep,
  OnboardingData,
} from "./onboarding-preferences-step";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./InitialUserConfiguration.module.css";

interface Props {
  onComplete: () => void;
}

export const InitialUserConfiguration = ({ onComplete }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [finish, setFinish] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [celebrationSeed, setCelebrationSeed] = useState<string>("");
  const [celebrationExpression, setCelebrationExpression] =
    useState<Expression>(happy);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const { setUsernameFirstTime } = useSetUsernameFirstTime();

  const { user, updateUser } = useUserDataStore(
    useShallow((state) => ({
      user: state.user,
      updateUser: state.updateUser,
    })),
  );

  const [typedUsername, setTypedUsername] = useState<string>(
    user?.username || "",
  );
  const [selectedAvatarType, setSelectedAvatarType] =
    useState<AvatarSourceType>("blobatar");
  const [variantSeed, setVariantSeed] = useState<number>(0);

  const [oauthAvatar, setOauthAvatar] = useState<string | null>(
    user?.avatar_url || null,
  );
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

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
          user?.avatar_url ||
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
  }, [user?.avatar_url]);

  useEffect(() => {
    if (user?.username && !typedUsername) {
      setTypedUsername(user.username);
    }
  }, [user?.username, typedUsername]);

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleRandomizeVariant = useCallback(() => {
    setVariantSeed((prev) => prev + 1);
  }, []);

  const getComputedAvatarUrl = (username: string) => {
    const effectiveSeed =
      variantSeed > 0 ? `${username}-${variantSeed}` : username;

    if (selectedAvatarType === "blobatar") {
      return `blobatar:${effectiveSeed}`;
    } else if (selectedAvatarType === "oauth") {
      return oauthAvatar;
    } else if (selectedAvatarType === "custom") {
      return customAvatar;
    }
    return "";
  };

  const onStep1Submit = async (username: string) => {
    setFormError(null);
    try {
      const searchRes = await searchUsers(username);
      if (searchRes.data) {
        const isTaken = searchRes.data.some(
          (u) => u.username.toLowerCase() === username.toLowerCase(),
        );
        if (isTaken) {
          return "Ese nombre de usuario ya está en uso.";
        }
      }
    } catch {
      return null;
    }

    setTypedUsername(username);
    setStep(2);
    return null;
  };

  const handleFinalize = async (data: OnboardingData | null) => {
    setIsSubmitting(true);
    setFormError(null);

    const effectiveUsername = typedUsername || user?.username || "alino";
    const effectiveSeed =
      variantSeed > 0 ? `${effectiveUsername}-${variantSeed}` : effectiveUsername;
    const finalAvatarUrl = getComputedAvatarUrl(effectiveUsername);

    const result = await setUsernameFirstTime(effectiveUsername, finalAvatarUrl);
    if (result?.error) {
      setIsSubmitting(false);
      setFormError(result.error);
      setStep(1);
      return;
    }

    if (data) {
      try {
        await saveUserOnboardingSurvey(data);
        if (data.referral_code) {
          const refResult = await applyReferralCodeAction(data.referral_code);
          if (refResult?.data?.success) {
            updateUser({ tier: "pro" });
          }
          clearStoredReferralCode();
        }
      } catch {
        return;
      }
    }

    setIsSubmitting(false);
    setCelebrationSeed(effectiveSeed);
    setFinish(true);

    if (selectedAvatarType === "blobatar") {
      setCelebrationExpression(happy);

      const t1 = setTimeout(() => {
        setCelebrationExpression(wink);
      }, 700);

      const t2 = setTimeout(() => {
        setCelebrationExpression(love);
      }, 1400);

      const t3 = setTimeout(() => {
        setIsExiting(true);
      }, 2100);

      const t4 = setTimeout(() => {
        onComplete();
      }, 2550);

      timersRef.current.push(t1, t2, t3, t4);
    } else {
      const t = setTimeout(() => {
        onComplete();
      }, 1400);
      timersRef.current.push(t);
    }
  };

  return (
    <motion.div
      className={styles.initialUserConfigurationContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {finish && selectedAvatarType === "blobatar" && (
          <motion.div
            key="blobatar-celebration"
            className={styles.celebrationWrapper}
            initial={{ scale: 0.35, opacity: 0 }}
            animate={
              isExiting
                ? { scale: 0, opacity: 0, rotate: 10 }
                : {
                    scale: [0.35, 1.25, 0.95, 1],
                    opacity: 1,
                    rotate: [0, -6, 6, 0],
                  }
            }
            transition={
              isExiting
                ? { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.65, ease: "easeOut" }
            }
          >
            <Blobatar
              name={celebrationSeed || typedUsername || "alino"}
              size={180}
              animate="always"
              expression={celebrationExpression}
            />
          </motion.div>
        )}

        {finish && selectedAvatarType !== "blobatar" && (
          <motion.h1
            key="finish-text"
            className={styles.initialText}
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            Bienvenido a Alino
          </motion.h1>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!finish && (
          <WindowComponent
            windowTitle={
              step === 1 ? "Bienvenido a Alino" : "Personaliza tu experiencia"
            }
            closeAction={false}
            adaptative={{ height: "auto", maxWidth: "520px" }}
            bgBlur={true}
            id={"initial-user-configuration-popup"}
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  className={styles.container}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <section className={styles.textsContainer}>
                    <p className={styles.subtitle}>
                      Antes de comenzar, define cómo quieres que los demás te
                      identifiquen en Alino.
                    </p>
                  </section>

                  {user ? (
                    <AvatarSelector
                      username={typedUsername || user.username || "alino"}
                      oauthAvatar={oauthAvatar}
                      oauthProvider={oauthProvider}
                      customAvatar={customAvatar}
                      onCustomAvatarChange={setCustomAvatar}
                      selectedType={selectedAvatarType}
                      onTypeChange={setSelectedAvatarType}
                      variantSeed={variantSeed}
                      onRandomizeVariant={handleRandomizeVariant}
                    />
                  ) : (
                    <Skeleton
                      style={{
                        width: "104px",
                        height: "104px",
                        borderRadius: "50%",
                      }}
                    />
                  )}

                  {user?.username ? (
                    <UsernameInput
                      initialValue={typedUsername || user.username}
                      onChangeValue={setTypedUsername}
                      onSubmit={onStep1Submit}
                      externalError={formError}
                    />
                  ) : (
                    <Skeleton
                      style={{
                        width: "100%",
                        height: "45px",
                        borderRadius: "10px",
                      }}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OnboardingPreferencesStep
                    avatarUrl={getComputedAvatarUrl(
                      typedUsername || user?.username || "alino",
                    )}
                    username={typedUsername || user?.username || "alino"}
                    onBack={() => setStep(1)}
                    onSubmit={handleFinalize}
                    onSkip={() => handleFinalize(null)}
                    isSubmitting={isSubmitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </WindowComponent>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
