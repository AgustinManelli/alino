"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { gaze, type Gaze } from "blobatar/gaze";
import {
  idle,
  happy,
  wink,
  love,
  type Expression,
} from "blobatar/expression";
import "blobatar/motion.css";
import "blobatar/gaze.css";

import {
  ArrowLeft,
  WorkProjectsIcon,
  StudyUniversityIcon,
  PersonalOrganizationIcon,
  TeamCollaborationIcon,
  SendIcon,
} from "@/components/ui/icons/icons";
import { UserAvatar } from "@/components/ui/UserAvatar/UserAvatar";
import { getStoredReferralCode } from "@/lib/utils/referral";
import { getBlobatarSeed } from "@/lib/utils/avatar";
import styles from "./OnboardingPreferencesStep.module.css";

export interface OnboardingData {
  goal: string | null;
  role: string | null;
  referral: string | null;
  referral_detail?: string | null;
  referral_code?: string | null;
}

interface Props {
  avatarUrl: string | null;
  username: string;
  onBack: () => void;
  onSubmit: (data: OnboardingData) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

export const OnboardingPreferencesStep = ({
  avatarUrl,
  username,
  onBack,
  onSubmit,
  onSkip,
  isSubmitting = false,
}: Props) => {
  const blobatarSeed = React.useMemo(
    () => getBlobatarSeed(avatarUrl, username),
    [avatarUrl, username],
  );
  const isBlobatar = Boolean(blobatarSeed);

  const [currentSubStep, setCurrentSubStep] = useState<1 | 2 | 3>(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [referralDetail, setReferralDetail] = useState<string>("");
  const [referralCodeInput, setReferralCodeInput] = useState<string>("");

  const [companionExpression, setCompanionExpression] =
    useState<Expression>(idle);
  const expressionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const companionContainerRef = useRef<HTMLDivElement | null>(null);
  const gazeDriverRef = useRef<Gaze | null>(null);

  const attachGaze = useCallback(() => {
    const container = companionContainerRef.current;
    if (!container) return;
    const svg = container.querySelector("svg");
    if (!svg || !(svg instanceof SVGSVGElement)) return;

    if (gazeDriverRef.current) {
      gazeDriverRef.current.stop();
      gazeDriverRef.current = null;
    }

    svg.style.setProperty("--mo-track-travel", "3px");
    const driver = gaze(svg, { target: "pointer" });
    gazeDriverRef.current = driver;
  }, []);

  const setCompanionRef = useCallback(
    (node: HTMLDivElement | null) => {
      companionContainerRef.current = node;
      if (node && isBlobatar) {
        attachGaze();
        requestAnimationFrame(() => {
          attachGaze();
        });
      }
    },
    [attachGaze, isBlobatar],
  );

  useEffect(() => {
    const stored = getStoredReferralCode();
    if (stored) {
      setReferralCodeInput(stored);
      setSelectedReferral("friend");
    }
  }, []);

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

  const triggerReaction = (expr: Expression) => {
    setCompanionExpression(expr);
    if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current);
    expressionTimerRef.current = setTimeout(() => {
      setCompanionExpression(idle);
    }, 1100);
  };

  const goals = [
    {
      id: "work",
      title: "Trabajo & Proyectos",
      desc: "Gestión profesional, tareas y entregas",
      icon: <WorkProjectsIcon className={styles.cardIcon} />,
    },
    {
      id: "study",
      title: "Estudio & Universidad",
      desc: "Materias, exámenes y aprendizaje",
      icon: <StudyUniversityIcon className={styles.cardIcon} />,
    },
    {
      id: "personal",
      title: "Organización Personal",
      desc: "Hábitos, rutinas diarias y metas",
      icon: <PersonalOrganizationIcon className={styles.cardIcon} />,
    },
    {
      id: "team",
      title: "Colaboración en Equipo",
      desc: "Proyectos compartidos y sincronización",
      icon: <TeamCollaborationIcon className={styles.cardIcon} />,
    },
  ];

  const roles = [
    { id: "dev", label: "Desarrollo & Tecnología" },
    { id: "design", label: "Diseño & Creatividad" },
    { id: "business", label: "Negocios & Gestión" },
    { id: "student", label: "Estudio & Universidad" },
    { id: "other", label: "Otro perfil" },
  ];

  const referrals = [
    { id: "friend", label: "Recomendación de un amigo" },
    { id: "social", label: "Redes sociales" },
    { id: "google", label: "Búsqueda web / Google" },
    { id: "other", label: "Otro canal" },
  ];

  const handleSelectGoal = (id: string) => {
    setSelectedGoal(id);
    triggerReaction(happy);
  };

  const handleSelectRole = (id: string) => {
    setSelectedRole(id);
    triggerReaction(wink);
  };

  const handleSelectReferral = (id: string) => {
    setSelectedReferral(id);
    triggerReaction(love);
  };

  const handleBack = () => {
    if (currentSubStep === 1) {
      onBack();
    } else {
      setCurrentSubStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleNext = () => {
    if (currentSubStep === 1 && selectedGoal) {
      setCurrentSubStep(2);
    } else if (currentSubStep === 2 && selectedRole) {
      setCurrentSubStep(3);
    }
  };

  const handleFinalSubmit = () => {
    onSubmit({
      goal: selectedGoal,
      role: selectedRole,
      referral: selectedReferral,
      referral_detail:
        selectedReferral === "other"
          ? referralDetail.trim() || null
          : null,
      referral_code:
        referralCodeInput.trim().replace(/^@/, "") || null,
    });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
            aria-label="Volver al paso anterior"
            title="Volver"
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
          </button>
          <span className={styles.stepBadge}>
            Pregunta {currentSubStep} de 3
          </span>
        </div>

        <div
          ref={setCompanionRef}
          className={styles.companionWrapper}
          title={isBlobatar ? "Tu Alinito copiloto" : "Tu foto de perfil"}
        >
          {isBlobatar && blobatarSeed ? (
            <Blobatar
              name={blobatarSeed}
              size={42}
              animate="always"
              expression={companionExpression}
            />
          ) : (
            <UserAvatar avatarUrl={avatarUrl} size={42} />
          )}
        </div>
      </div>

      <div className={styles.progressBarWrapper}>
        <div
          className={`${styles.progressSegment} ${currentSubStep >= 1 ? styles.progressSegmentActive : ""}`}
        />
        <div
          className={`${styles.progressSegment} ${currentSubStep >= 2 ? styles.progressSegmentActive : ""}`}
        />
        <div
          className={`${styles.progressSegment} ${currentSubStep >= 3 ? styles.progressSegmentActive : ""}`}
        />
      </div>

      <AnimatePresence mode="wait">
        {currentSubStep === 1 && (
          <motion.div
            key="substep-1"
            className={styles.questionBlock}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={styles.questionHeader}>
              <h3 className={styles.questionTitle}>
                ¿Cuál es tu objetivo principal?
              </h3>
              <p className={styles.questionDesc}>
                Elige el propósito central con el que usarás Alino.
              </p>
            </div>

            <div className={styles.cardsGrid}>
              {goals.map((item) => {
                const isSelected = selectedGoal === item.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ""}`}
                    onClick={() => handleSelectGoal(item.id)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={styles.cardHeader}>
                      {item.icon}
                      <span className={styles.cardTitle}>{item.title}</span>
                    </div>
                    <p className={styles.cardDesc}>{item.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentSubStep === 2 && (
          <motion.div
            key="substep-2"
            className={styles.questionBlock}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={styles.questionHeader}>
              <h3 className={styles.questionTitle}>
                ¿Cuál es tu rol o perfil principal?
              </h3>
              <p className={styles.questionDesc}>
                Personalizaremos tu panel y sugerencias de acuerdo a tu actividad.
              </p>
            </div>

            <div className={styles.optionsList}>
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`${styles.listOptionItem} ${isSelected ? styles.listOptionItemSelected : ""}`}
                    onClick={() => handleSelectRole(r.id)}
                  >
                    <span>{r.label}</span>
                    <div
                      className={`${styles.radioDot} ${isSelected ? styles.radioDotSelected : ""}`}
                    >
                      {isSelected && <div className={styles.radioDotInner} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {currentSubStep === 3 && (
          <motion.div
            key="substep-3"
            className={styles.questionBlock}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={styles.questionHeader}>
              <h3 className={styles.questionTitle}>
                ¿Cómo descubriste Alino?
              </h3>
              <p className={styles.questionDesc}>
                Nos ayuda a conocer los canales donde conectar mejor con la comunidad.
              </p>
            </div>

            <div className={styles.optionsList}>
              {referrals.map((ref) => {
                const isSelected = selectedReferral === ref.id;
                return (
                  <React.Fragment key={ref.id}>
                    <button
                      type="button"
                      className={`${styles.listOptionItem} ${isSelected ? styles.listOptionItemSelected : ""}`}
                      onClick={() => handleSelectReferral(ref.id)}
                    >
                      <span>{ref.label}</span>
                      <div
                        className={`${styles.radioDot} ${isSelected ? styles.radioDotSelected : ""}`}
                      >
                        {isSelected && <div className={styles.radioDotInner} />}
                      </div>
                    </button>

                    {ref.id === "friend" && (
                      <AnimatePresence>
                        {selectedReferral === "friend" && (
                          <motion.div
                            className={styles.referralFriendWrapper}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className={styles.referralInputGroup}>
                              <input
                                type="text"
                                className={styles.referralFriendField}
                                placeholder="Código de tu amigo (ej. ALN7K9X)"
                                value={referralCodeInput}
                                onChange={(e) => {
                                  const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                                  setReferralCodeInput(raw);
                                }}
                                maxLength={12}
                                autoFocus={!referralCodeInput}
                              />
                            </div>
                            <span className={styles.referralHelperText}>
                              Ingresa el código único de invitación de tu amigo para recibir días de Plan Pro gratis.
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    {ref.id === "other" && (
                      <AnimatePresence>
                        {selectedReferral === "other" && (
                          <motion.div
                            className={styles.otherInputWrapper}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <input
                              type="text"
                              className={styles.otherInputField}
                              placeholder="¿Dónde nos conociste? (ej. YouTube, TikTok, Podcast...)"
                              value={referralDetail}
                              onChange={(e) => setReferralDetail(e.target.value)}
                              maxLength={100}
                              autoFocus
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.actionsBar}>
        <button
          type="button"
          className={styles.btnSkip}
          onClick={onSkip}
          disabled={isSubmitting}
        >
          Omitir por ahora
        </button>

        <div className={styles.actionsRight}>
          {currentSubStep < 3 ? (
            <button
              type="button"
              className={`${styles.btnNext} ${(currentSubStep === 1 && selectedGoal) || (currentSubStep === 2 && selectedRole) ? styles.btnNextActive : ""}`}
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (currentSubStep === 1 && !selectedGoal) ||
                (currentSubStep === 2 && !selectedRole)
              }
            >
              <span>Siguiente</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnSubmit}
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <span>Comenzar en Alino</span>
                  <SendIcon style={{ width: "15px", height: "15px" }} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
