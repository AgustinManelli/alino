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
  planId: string
): Promise<{ url: string; subscriptionId: string }> {
  const supabaseAdmin = getAdminClient();
  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });
  const preapprovalClient = new PreApproval(mpClient);

  const { data: plan } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!plan || !plan.is_active) {
    throw new Error("El plan seleccionado no es válido o está inactivo.");
  }

  if (!plan.mp_plan_id) {
    throw new Error(
      `El plan "${plan.name}" no tiene un PreApprovalPlan de MercadoPago. ` +
        "Ejecute scripts/setup-mp-plans.ts para generarlo."
    );
  }

  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError || !authUser?.user) throw new Error("Usuario no encontrado.");
  const payerEmail = authUser.user.email;
  if (!payerEmail) throw new Error("El usuario no tiene email registrado.");

  const { eligible: isTrialEligible, trial_days: trialDays } =
    await checkTrialEligibilityAdmin(userId);

  const rawAmount =
    Number(plan.price) * (1 - (plan.discount_percentage || 0) / 100);
  const amount = Number(rawAmount.toFixed(2));

  const autoRecurring: Record<string, unknown> = {
    frequency: 1,
    frequency_type: "months",
    transaction_amount: amount,
    currency_id: process.env.MP_CURRENCY_ID || "ARS",
  };

  if (isTrialEligible && trialDays > 0) {
    autoRecurring.free_trial = {
      frequency: trialDays,
      frequency_type: "days",
    };
    const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    autoRecurring.start_date = trialEnd.toISOString();
  }

  const preapprovalResponse = await preapprovalClient.create({
    body: {
      reason: plan.mp_reason,
      external_reference: `${userId}|${plan.tier}`,
      payer_email: payerEmail,
      // payer_email: "test_user_2010509834873916104@testuser.com",
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/return`,
      auto_recurring: autoRecurring,
      status: "pending",
    } as any,
  });

  if (!preapprovalResponse.init_point || !preapprovalResponse.id) {
    throw new Error("MercadoPago no devolvió una URL o ID válido.");
  }

  const preapprovalId = String(preapprovalResponse.id);

  await supabaseAdmin.rpc("create_checkout_session", {
    p_user_id: userId,
    p_gateway: "mercadopago",
    p_external_sub_id: preapprovalId,
  });

  await supabaseAdmin
    .from("checkout_sessions")
    .update({ plan_id: planId, tier: plan.tier })
    .eq("external_sub_id", preapprovalId);

  console.log(
    `[MP] PreApproval creado: ${preapprovalId} | user: ${userId} | ` +
      `mp_plan: ${plan.mp_plan_id} | trial: ${isTrialEligible}`
  );

  return {
    url: preapprovalResponse.init_point,
    subscriptionId: preapprovalId,
  };
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