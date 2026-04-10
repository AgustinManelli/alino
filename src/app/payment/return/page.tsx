// app/payment/return/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getSubscriptionByExternalId,
  getActiveSubscription,
} from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import styles from "./PaymentReturn.module.css";
import { LoadingIcon } from "@/components/ui/icons/icons";

type Stage = "loading" | "success" | "pending" | "error";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 16;

export default function PaymentReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>("loading");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const preapprovalId = searchParams.get("preapproval_id");
  const gateway = "mercadopago" as const;

  useEffect(() => {
    if (!preapprovalId) {
      checkActiveSubscription();
      return;
    }
    startPolling();
    return () => stopPolling();
  }, []);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function handleSuccess(tier: string) {
    stopPolling();
    setStage("success");

    if (globalUserStore) {
      globalUserStore.setState((state) => ({
        user: state.user ? { ...state.user, tier: tier as any } : null,
      }));
    }

    setTimeout(() => router.replace("/alino-app"), 3000);
  }

  async function checkActiveSubscription() {
    const { data } = await getActiveSubscription();
    if (data && data.tier !== "free" && data.status !== "free") {
      handleSuccess(data.tier);
    } else {
      setStage("pending");
    }
  }

  async function checkStatus() {
    if (!preapprovalId) return;

    const { data, error } = await getSubscriptionByExternalId(
      preapprovalId,
      gateway,
    );

    if (error) return;

    if (
      data?.status === "active" ||
      data?.status === "trialing" ||
      (data?.tier && data.tier !== "free" && data.status !== "not_found")
    ) {
      handleSuccess(data.tier);
    }
  }

  function startPolling() {
    checkStatus();

    intervalRef.current = setInterval(() => {
      attemptsRef.current += 1;

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        stopPolling();
        setStage("pending");
        return;
      }

      checkStatus();
    }, POLL_INTERVAL_MS);
  }

  const handleGoToApp = () => router.replace("/alino-app");

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {stage === "loading" && (
          <>
            <LoadingIcon className={styles.lodingIcon} />
            <h2 className={styles.title}>Confirmando tu pago…</h2>
            <p className={styles.text}>
              Estamos verificando tu pago. Esto puede tardar unos segundos.
            </p>
          </>
        )}

        {stage === "success" && (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h2 className={styles.title} style={{ color: "#10b981" }}>
              ¡Bienvenido a Alino Pro!
            </h2>
            <p className={styles.text}>
              Tu pago fue confirmado exitosamente. Redirigiendo a tu aplicación…
            </p>
          </>
        )}

        {stage === "pending" && (
          <>
            <h2 className={styles.title}>Pago en procesamiento</h2>
            <p className={styles.text}>
              Estamos procesando tu pago. Tu plan{" "}
              <strong>se activará automáticamente</strong> en minutos, sin
              necesidad de hacer nada más.
            </p>
            <button className={styles.btn} onClick={handleGoToApp}>
              Volver a la app
            </button>
          </>
        )}

        {stage === "error" && (
          <>
            <div className={styles.iconError}>✕</div>
            <h2 className={styles.title} style={{ color: "#ef4444" }}>
              Ocurrió un error
            </h2>
            <p className={styles.text}>
              No pudimos verificar tu pago. Si se realizó el cobro, contactá
              soporte.
            </p>
            <button className={styles.btn} onClick={handleGoToApp}>
              Volver a la app
            </button>
          </>
        )}
      </div>
    </div>
  );
}
