import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { dispatchAllNotifications } from "@/lib/notifications/notificationDispatcher";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function verifyAuthorization(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron-notifications] CRON_SECRET is not configured in environment variables.");
    return false;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const expected = `Bearer ${cronSecret}`;
  const authBuf = Buffer.from(authHeader);
  const expBuf = Buffer.from(expected);

  if (authBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(authBuf, expBuf);
}

export async function GET(req: Request) {
  if (!verifyAuthorization(req)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const summary = await dispatchAllNotifications(supabaseAdmin, {
      timeBudgetMs: 40_000,
    });

    return NextResponse.json({
      ...summary,
    });
  } catch (err: any) {
    console.error("[cron-notifications] Execution error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
