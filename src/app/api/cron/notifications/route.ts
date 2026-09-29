import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dispatchAllNotifications } from "@/lib/notifications/notificationDispatcher";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function verifyAuthorization(req: Request): boolean {
  if (!process.env.CRON_SECRET) {
    return true;
  }
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!verifyAuthorization(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    const summary = await dispatchAllNotifications(supabaseAdmin);
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
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
