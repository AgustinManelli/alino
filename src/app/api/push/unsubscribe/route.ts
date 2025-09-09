import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // 1. Autenticar al usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { endpoint } = (await request.json()) as { endpoint?: string };

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint is required" },
        { status: 400 }
      );
    }

    // 2. Eliminar la suscripción de la base de datos
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .match({ endpoint: endpoint, user_id: user.id });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
