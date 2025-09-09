import { NextRequest, NextResponse } from "next/server";
import type { PushSubscription } from "web-push";
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
    const newSubscription = (await request.json()) as PushSubscription;

    // 2. Preparar los datos para la base de datos
    const subscriptionData = {
      user_id: user.id,
      endpoint: newSubscription.endpoint,
      p256dh: newSubscription.keys.p256dh,
      auth: newSubscription.keys.auth,
    };

    // 3. Guardar en Supabase usando 'upsert'
    // Upsert intentará insertar, pero si ya existe un 'endpoint' igual,
    // actualizará el registro. Esto evita errores si un usuario se suscribe dos veces.
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(subscriptionData, { onConflict: "endpoint" });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}
