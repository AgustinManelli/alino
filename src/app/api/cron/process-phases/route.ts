import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { updateMPSubscriptionPrice } from "@/lib/api/user/payments";

const CONCURRENCY = 5;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  const isAuthorized =
    process.env.CRON_SECRET &&
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isAuthorized) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { data: subsToUpdate, error } = await supabaseAdmin
      .from("subscriptions")
      .select("id, subscription_id, gateway, next_billing_amount")
      .eq("status", "active")
      .eq("gateway", "mercadopago")
      .lte("phase_ends_at", new Date().toISOString())
      .not("next_billing_amount", "is", null)
      .limit(100);

    if (error) throw error;

    if (!subsToUpdate || subsToUpdate.length === 0) {
      return NextResponse.json({ message: "No hay fases por procesar hoy." });
    }

    const results: { id: string; status: string; error?: string }[] = [];

    for (let i = 0; i < subsToUpdate.length; i += CONCURRENCY) {
      const batch = subsToUpdate.slice(i, i + CONCURRENCY);

      const batchResults = await Promise.allSettled(
        batch.map(async (sub) => {
          await updateMPSubscriptionPrice(
            sub.subscription_id,
            sub.next_billing_amount
          );
          await supabaseAdmin
            .from("subscriptions")
            .update({ next_billing_amount: null, phase_ends_at: null })
            .eq("id", sub.id);
          return { id: sub.subscription_id, status: "updated" };
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error("[cron] Error en batch:", result.reason);
          results.push({
            id: "unknown",
            status: "error",
            error: result.reason?.message,
          });
        }
      }
    }

    return NextResponse.json({
      processed: results.filter((r) => r.status === "updated").length,
      failed: results.filter((r) => r.status === "error").length,
      details: results,
    });
  } catch (err: any) {
    console.error("[cron] Error general:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}