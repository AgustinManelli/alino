import { NextResponse } from "next/server";
import {
  MercadoPagoConfig,
  PreApproval,
  Payment,
  PreApprovalPlan,
} from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

const GATEWAY = "mercadopago" as const;

function getMPClients() {
  const mpConfig = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  return {
    mpConfig,
    preapproval: new PreApproval(mpConfig),
    payment: new Payment(mpConfig),
  };
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

type OurSubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "trialing";

function verifyMPSignature(req: Request, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const xSig = req.headers.get("x-signature");
  const xReqId = req.headers.get("x-request-id");

  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[MP] ⚠️  MP_WEBHOOK_SECRET no configurado (dev mode).");
      return true;
    }
    console.error("[MP] ❌ MP_WEBHOOK_SECRET no configurado en producción.");
    return false;
  }

  if (!xSig) return false;

  let parsedBody: any = {};
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {}
  }

  const url = new URL(req.url);
  const dataId =
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    parsedBody.data?.id ??
    "";

  const parts: Record<string, string> = {};
  xSig.split(",").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  });

  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const template = `id:${dataId};request-id:${xReqId ?? ""};ts:${ts};`;
  const digest = createHmac("sha256", secret).update(template).digest("hex");
  return digest === v1;
}

function mapMPStatus(
  mpStatus?: string | null,
  hasActiveTrial?: boolean,
): OurSubscriptionStatus {
  switch (mpStatus) {
    case "authorized":
      return hasActiveTrial ? "trialing" : "active";
    case "pending":
      return "incomplete";
    case "paused":
      return "past_due";
    case "cancelled":
      return "canceled";
    default:
      return "incomplete";
  }
}

async function registerEvent(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  eventId: string,
  eventType: string,
  payload: object,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("register_webhook_event", {
    p_gateway: GATEWAY,
    p_event_id: eventId,
    p_event_type: eventType,
    p_payload: payload,
  });
  if (error) {
    console.error(`[MP] Error registrando evento ${eventId}:`, error.message);
    return false;
  }
  return data === true;
}

async function resolveExternalRef(
  sub: any,
  mpConfig: MercadoPagoConfig,
): Promise<string> {
  if (sub.external_reference) return sub.external_reference;
  if (sub.preapproval_plan_id) {
    try {
      const planClient = new PreApprovalPlan(mpConfig);
      const plan = (await planClient.get({
        preApprovalPlanId: String(sub.preapproval_plan_id),
      })) as any;
      return plan.external_reference || "";
    } catch (err) {
      console.error(
        `[MP] No se pudo obtener external_reference del plan ${sub.preapproval_plan_id}:`,
        err,
      );
      return "";
    }
  }
  return "";
}

export async function POST(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const { preapproval, payment, mpConfig } = getMPClients();

  let rawBody = "";
  let parsedBody: any = {};
  try {
    rawBody = await req.text();
    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {}
    }
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (!verifyMPSignature(req, rawBody)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const url = new URL(req.url);
  let type =
    url.searchParams.get("type") ??
    url.searchParams.get("topic") ??
    parsedBody.type;

  if (!type && parsedBody.action) {
    type = parsedBody.action.split(".")[0];
  }

  const id =
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    parsedBody.data?.id;

  if (!type || !id) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  console.log(`[MP] 📬 Procesando evento: ${type}:${id}`);

  try {
    if (type === "subscription_preapproval" || type === "preapproval") {
      const sub = await preapproval.get({ id });

      if (sub.status === "pending") {
        console.log(`[MP] Ignorando checkout pendiente: ${sub.id}`);
        return new NextResponse("OK", { status: 200 });
      }

      const rawRef = await resolveExternalRef(sub as any, mpConfig);
      const [userId, tierStr] = rawRef.split("|");
      const purchasedTier = tierStr || "pro";

      if (!userId) {
        console.warn("[MP] Suscripción sin external_reference:", id);
        return new NextResponse("OK", { status: 200 });
      }

      const eventId = `${type}:${id}:${sub.status}`;
      const isNew = await registerEvent(supabaseAdmin, eventId, type, {
        type,
        id,
        status: sub.status,
      });

      if (!isNew) {
        console.log(`[MP] Evento duplicado ignorado: ${eventId}`);
        return new NextResponse("Duplicate", { status: 200 });
      }

      const autoRecurring = (sub as any).auto_recurring;
      const startDate = autoRecurring?.start_date
        ? new Date(autoRecurring.start_date)
        : null;
      const hasActiveTrial =
        startDate !== null &&
        startDate.getTime() - Date.now() > 2 * 24 * 60 * 60 * 1000;

      const status = mapMPStatus(sub.status, hasActiveTrial);

      if (status === "canceled") {
        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("subscription_id", String(sub.id))
          .single();

        if (!existingSub) {
          console.log(
            `[MP] Cancelación ignorada: sub ${sub.id} no existe en BD`,
          );
          return new NextResponse("Ignored", { status: 200 });
        }
      }

      const now = new Date();
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("current_period_end")
        .eq("subscription_id", String(sub.id))
        .single();

      let periodEnd: Date;
      if (existingSub) {
        periodEnd = new Date(existingSub.current_period_end);
      } else {
        periodEnd =
          hasActiveTrial && startDate
            ? startDate
            : sub.next_payment_date
              ? new Date(sub.next_payment_date)
              : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      const { error } = await supabaseAdmin.rpc(
        "process_gateway_subscription",
        {
          p_user_id: userId,
          p_gateway: GATEWAY,
          p_subscription_id: String(sub.id),
          p_customer_id: String(sub.payer_id ?? ""),
          p_tier: purchasedTier as any,
          p_status: status,
          p_period_start: now.toISOString(),
          p_period_end: periodEnd.toISOString(),
          p_cancel_at_period_end: false,
          p_event_id: eventId,
        },
      );
      if (error) throw new Error(error.message);

      if (status === "active" || status === "trialing") {
        await supabaseAdmin.rpc("complete_checkout_session", {
          p_external_sub_id: String(sub.id),
          p_gateway: GATEWAY,
        });

        const { data: session } = await supabaseAdmin
          .from("checkout_sessions")
          .select("offer_applied, normal_price, trial_days_applied")
          .eq("external_sub_id", String(sub.id))
          .eq("gateway", GATEWAY)
          .maybeSingle();

        if (session?.offer_applied && session.normal_price) {
          const { data: phaseSetting } = await supabaseAdmin
            .from("settings")
            .select("value")
            .eq("setting", "OFFER_PHASE_DAYS")
            .single();
          const offerPhaseDays =
            (phaseSetting?.value ?? 90) + (session.trial_days_applied ?? 0);

          await supabaseAdmin.rpc("activate_offer_phase", {
            p_subscription_id: String(sub.id),
            p_gateway: GATEWAY,
            p_normal_price: session.normal_price,
            p_phase_days: offerPhaseDays,
          });
        }
      }

      console.log(
        `[MP] ✅ sub ${sub.id}: MP="${sub.status}" trial=${hasActiveTrial} → BD="${status}" user=${userId}`,
      );
    } else if (type === "subscription_preapproval_deactivated") {
      const sub = await preapproval.get({ id });
      const eventId = `${type}:${id}`;

      const isNew = await registerEvent(supabaseAdmin, eventId, type, {
        type,
        id,
      });
      if (!isNew) return new NextResponse("Duplicate", { status: 200 });

      const { error } = await supabaseAdmin.rpc("cancel_gateway_subscription", {
        p_subscription_id: String(sub.id),
        p_gateway: GATEWAY,
        p_event_id: eventId,
      });
      if (error) throw new Error(error.message);

      console.log(`[MP] ✅ Cancelada: ${sub.id}`);
    } else if (
      type === "payment" ||
      type === "subscription_authorized_payment"
    ) {
      let pay;
      try {
        pay = await payment.get({ id });
      } catch (err: any) {
        if (err?.message?.includes("not found") || err?.status === 404) {
          console.log(`[MP] Pago ${id} no disponible aún en API, ignorando.`);
          return new NextResponse("OK", { status: 200 });
        }
        throw err;
      }

      if (pay.status !== "approved") {
        console.log(`[MP] Pago ${id} ignorado (estado: ${pay.status})`);
        return new NextResponse("OK", { status: 200 });
      }

      const preapprovalId = (pay as any).preapproval_id;
      if (!preapprovalId) {
        console.log(`[MP] Pago ${id} sin preapproval_id, ignorado`);
        return new NextResponse("OK", { status: 200 });
      }

      const sub = await preapproval.get({ id: String(preapprovalId) });

      const rawRef = await resolveExternalRef(sub as any, mpConfig);
      const [userId, tierStr] = rawRef.split("|");
      const purchasedTier = tierStr || "pro";

      if (!userId) {
        console.warn(
          `[MP] Pago ${id}: suscripción ${preapprovalId} sin external_reference`,
        );
        return new NextResponse("OK", { status: 200 });
      }

      const eventId = `${type}:${id}`;
      const isNew = await registerEvent(supabaseAdmin, eventId, type, {
        type,
        id,
        preapproval_id: preapprovalId,
      });
      if (!isNew) {
        console.log(`[MP] Duplicado ignorado: ${eventId}`);
        return new NextResponse("Duplicate", { status: 200 });
      }

      const periodEnd = sub.next_payment_date
        ? new Date(sub.next_payment_date)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { error } = await supabaseAdmin.rpc(
        "process_gateway_subscription",
        {
          p_user_id: userId,
          p_gateway: GATEWAY,
          p_subscription_id: String(sub.id),
          p_customer_id: String(sub.payer_id ?? ""),
          p_tier: purchasedTier as any,
          p_status: "active",
          p_period_start: new Date().toISOString(),
          p_period_end: periodEnd.toISOString(),
          p_cancel_at_period_end: false,
          p_event_id: eventId,
        },
      );
      if (error) throw new Error(error.message);

      console.log(
        `[MP] ✅ Pago procesado: ${id} → user ${userId} | sub ${sub.id}`,
      );
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error(`[MP] ❌ Error:`, err.message);
    return new NextResponse("Internal error", { status: 500 });
  }
}
