import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

interface TrialEligibility {
  eligible: boolean;
  trial_days: number;
}

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

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan || !plan.is_active) throw new Error("Plan inválido o inactivo.");

  const { eligible: isFirstTimer, trial_days: trialDays } =
    await checkTrialEligibilityAdmin(userId);

  const normalPrice  = Number(plan.price);
  const offerPrice   = isFirstTimer
    ? Number((normalPrice * (1 - plan.discount_percentage)).toFixed(2))
    : normalPrice;

  const autoRecurring: Record<string, unknown> = {
    frequency:          1,
    frequency_type:     "months",
    transaction_amount: offerPrice,
    currency_id:        process.env.MP_CURRENCY_ID || "ARS",
  };

  if (isFirstTimer && trialDays > 0) {
    autoRecurring.free_trial = {
      frequency:      trialDays,
      frequency_type: "days",
    };
  }

  const preapprovalResponse = await preapprovalClient.create({
    body: {
      reason:             plan.mp_reason,
      external_reference: `${userId}|${plan.tier}`,
      payer_email:        payerEmail,
      back_url:           `${process.env.NEXT_PUBLIC_APP_URL}/payment/return`,
      auto_recurring:     autoRecurring,
      status:             "pending",
    } as any,
  });

  if (!preapprovalResponse.init_point || !preapprovalResponse.id) {
    throw new Error("MercadoPago no devolvió URL o ID válido.");
  }

  const preapprovalId = String(preapprovalResponse.id);

  await supabaseAdmin.rpc("create_checkout_session", {
    p_user_id:        userId,
    p_gateway:        "mercadopago",
    p_external_sub_id: preapprovalId,
  });

  await supabaseAdmin
    .from("checkout_sessions")
    .update({
      plan_id:            planId,
      tier:               plan.tier,
      offer_applied:      isFirstTimer,
      normal_price:       isFirstTimer ? normalPrice : null,
      trial_days_applied: isFirstTimer ? trialDays   : 0,
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