import { NextRequest, NextResponse } from "next/server";
import webpush, { type PushSubscription } from "web-push";
import { createClient } from "@supabase/supabase-js";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:ayuda@alino.online.",
  vapidPublicKey,
  vapidPrivateKey
);

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // 1. Seguridad: Verifica la llave secreta
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Obtiene los datos de la nueva notificación del webhook
  const newNotification = await request.json();
  const { record } = newNotification;
  const userId = record.invited_user_id;

  if (!userId) {
    return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
  }

  // 3. Busca las suscripciones push de ese usuario en BD
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    console.log(`No hay suscripciones para el usuario ${userId}`);
    return NextResponse.json({ message: "No subscriptions found for user." });
  }

  // 4. Envía la notificación a todos los dispositivos del usuario
  const notificationPayload = {
    title: "Nueva Invitación",
    body: `${record.inviter_display_name} te ha invitado a la lista "${record.list_name}".`,
  };

  const promises = subscriptions.map(async (sub) => {
    try {
      const subObject: PushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      await webpush.sendNotification(
        subObject,
        JSON.stringify(notificationPayload)
      );
    } catch (error: any) {
      // Si el error es 410 (Gone) o 404 (Not Found), la suscripción es inválida.
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(
          `Suscripción obsoleta detectada (${sub.endpoint}). Eliminando...`
        );
        // Elimina la suscripción de la base de datos
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      } else {
        console.error("Error al enviar notificación:", error);
      }
    }
  });

  await Promise.all(promises);

  return NextResponse.json({ message: "Notification process completed." });
}
