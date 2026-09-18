import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { resolvePlanPrice } from "@/config/regionalPricing";

interface TrialEligibility {
  eligible: boolean;
  trial_days: number;
}

const TIER_WEIGHT: Record<string, number> = {
  free: 0,
  student: 1,
  pro: 2,
  ultra: 3,
};

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function checkTrialEligibilityAdmin(
  userId: string
): Promise<TrialEligibility> {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin.rpc(
    "check_user_trial_eligibility_admin",
    { p_user_id: userId }
  );
  if (error) {
    console.error("[payments] Error checking trial eligibility:", error);
    return { eligible: false, trial_days: 30 };
  }
  return data as TrialEligibility;
}

export async function createMPSubscription(
  userId: string,
  planId: string,
  payerEmail: string
): Promise<{ url: string; subscriptionId: string }> {
  const supabaseAdmin = getAdminClient();
  const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
  const preapprovalClient = new PreApproval(mpClient);

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("tier")
    .eq("user_id", userId)
    .single();

  const currentTier = (userData?.tier || "free") as string;
  const currentTierWeight = TIER_WEIGHT[currentTier] ?? 0;

  if (currentTierWeight >= 3) {
    throw new Error("Ya posees el plan máximo disponible (Ultra).");
  }

  const { data: userPrivate } = await supabaseAdmin
    .from("user_private")
    .select("country_code")
    .eq("user_id", userId)
    .maybeSingle();

  const countryCode = (userPrivate?.country_code || "AR").toUpperCase();

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan || !plan.is_active) throw new Error("Plan inválido o inactivo.");

  const targetTierWeight = TIER_WEIGHT[plan.tier] ?? 0;

  if (targetTierWeight <= currentTierWeight) {
    throw new Error("Ya posees este plan o uno de nivel superior.");
  }

  const regional = resolvePlanPrice(plan, countryCode);
  let planCurrency = regional.currency;
  let normalPrice = regional.amount;

  if (planCurrency !== "ARS" && plan.regional_prices && (plan.regional_prices as any)["AR"]?.currency === "ARS") {
    normalPrice = (plan.regional_prices as any)["AR"].amount;
    planCurrency = "ARS";
  }

  const isUpgrade = currentTierWeight === 2 && targetTierWeight === 3;

  let initialCharge = normalPrice;
  let isOfferApplied = false;
  let appliedTrialDays = 0;

  if (isUpgrade) {
    const { data: currentPlan } = await supabaseAdmin
      .from("subscription_plans")
      .select("*")
      .eq("tier", currentTier)
      .maybeSingle();

    let currentPrice = 0;
    if (currentPlan) {
      const currentResolved = resolvePlanPrice(currentPlan, countryCode);
      currentPrice = currentResolved.amount;
    }

    initialCharge = Math.max(normalPrice - currentPrice, 1);
    isOfferApplied = true;
    appliedTrialDays = 0;
  } else {
    const { eligible: isFirstTimer, trial_days: trialDays } =
      await checkTrialEligibilityAdmin(userId);

    if (isFirstTimer && plan.discount_percentage && plan.discount_percentage > 0) {
      initialCharge = Number((normalPrice * (1 - plan.discount_percentage / 100)).toFixed(2));
      isOfferApplied = true;
    } else {
      initialCharge = normalPrice;
      isOfferApplied = false;
    }
    appliedTrialDays = isFirstTimer ? trialDays : 0;
  }

  const autoRecurring: Record<string, unknown> = {
    frequency: 1,
    frequency_type: "months",
    transaction_amount: initialCharge,
    currency_id: planCurrency,
  };

  if (!isUpgrade && appliedTrialDays > 0) {
    autoRecurring.free_trial = {
      frequency: appliedTrialDays,
      frequency_type: "days",
    };
  }

  const reasonText = isUpgrade
    ? `${plan.name} - Mejora desde Pro`
    : plan.mp_reason;

  const preapprovalResponse = await preapprovalClient.create({
    body: {
      reason: reasonText,
      external_reference: `${userId}|${plan.tier}`,
      payer_email: payerEmail,
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/return`,
      auto_recurring: autoRecurring,
      status: "pending",
    } as any,
  });

  if (!preapprovalResponse.init_point || !preapprovalResponse.id) {
    throw new Error("MercadoPago no devolvió URL o ID válido.");
  }

  const preapprovalId = String(preapprovalResponse.id);

  await supabaseAdmin.rpc("create_checkout_session", {
    p_user_id: userId,
    p_gateway: "mercadopago",
    p_external_sub_id: preapprovalId,
  });

  await supabaseAdmin
    .from("checkout_sessions")
    .update({
      plan_id: planId,
      tier: plan.tier,
      offer_applied: isOfferApplied,
      normal_price: isOfferApplied ? normalPrice : null,
      trial_days_applied: appliedTrialDays,
    })
    .eq("external_sub_id", preapprovalId);

  return { url: preapprovalResponse.init_point, subscriptionId: preapprovalId };
}

export async function cancelMPSubscription(subscriptionId: string) {
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const preapprovalClient = new PreApproval(mpClient);

  await preapprovalClient.update({
    id: subscriptionId,
    body: { status: "cancelled" },
  });

  console.log(`[MP] Suscripción cancelada: ${subscriptionId}`);
}

export async function updateMPSubscriptionPrice(subscriptionId: string, newAmount: number) {
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const preapprovalClient = new PreApproval(mpClient);

  await preapprovalClient.update({
    id: subscriptionId,
    body: {
      auto_recurring: {
        transaction_amount: newAmount,
      }
    } as any,
  });
}