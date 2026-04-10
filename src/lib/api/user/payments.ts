import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

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
  userEmail: string,
  planId: string
): Promise<{ url: string; subscriptionId: string }> {
  const supabaseAdmin = getAdminClient();
  const preapprovalClient = new PreApproval(mpClient);

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (!userData) throw new Error("Usuario no encontrado");

  const { data: planData } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .eq("id", planId)
    .single();

  if (!planData || !planData.is_active) {
    throw new Error("El plan seleccionado no es válido o está inactivo.");
  }

  const { eligible: isTrialEligible, trial_days: trialDays } =
    await checkTrialEligibilityAdmin(userId);

  const rawAmount = Number(planData.price) * (1 - (planData.discount_percentage || 0) / 100);
  const amount = Number(rawAmount.toFixed(2));

  const daysOffset = isTrialEligible ? trialDays : 1;
  const startDate = new Date(
    Date.now() + daysOffset * 24 * 60 * 60 * 1000
  );

  const body: any = {
    payer_email: userEmail,
    // payer_email: "test_user_2010509834873916104@testuser.com",
    reason: planData.mp_reason,
    external_reference: `${userId}|${planData.tier}`,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: amount,
      currency_id: process.env.MP_CURRENCY_ID || "ARS",
      start_date: startDate.toISOString(),
    },
    back_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/return`,
    status: "pending",
  };

  const response = await preapprovalClient.create({ body });

  if (!response.init_point || !response.id) {
    throw new Error("Mercado Pago no devolvió una URL o ID válido.");
  }

  await supabaseAdmin.rpc("create_checkout_session", {
    p_user_id: userId,
    p_gateway: "mercadopago",
    p_external_sub_id: String(response.id),
  });

  await supabaseAdmin
    .from("checkout_sessions")
    .update({ plan_id: planId, tier: planData.tier })
    .eq("external_sub_id", String(response.id));

  console.log(
    `[MP] Suscripción creada: ${response.id} para user ${userId}, trial: ${isTrialEligible}`
  );

  return {
    url: response.init_point,
    subscriptionId: String(response.id),
  };
}