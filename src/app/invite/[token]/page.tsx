// app/invite/[token]/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  getInviteLinkInfo,
  useInviteLink,
} from "@/lib/api/list/invite-link-actions";
import { InviteJoinClient } from "./InviteJoinClient";

interface Props {
  params: { token: string };
}

export default async function InvitePage({ params }: Props) {
  const { token } = params;

  const { data: info, error } = await getInviteLinkInfo(token);

  if (error || !info) {
    return (
      <InviteJoinClient
        status="error"
        message="No se pudo obtener la información del enlace."
      />
    );
  }

  if (!info.valid) {
    const messages: Record<string, string> = {
      not_found: "Este enlace no existe.",
      revoked: "Este enlace fue revocado.",
      expired: "Este enlace ha expirado.",
      max_uses: "Este enlace ha alcanzado su límite de usos.",
    };
    return (
      <InviteJoinClient
        status="invalid"
        message={messages[info.reason ?? "not_found"] ?? "Enlace inválido."}
      />
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect_url=/invite/${token}`);
  }

  const { data: joinResult, error: joinError } = await useInviteLink(token);

  if (joinError) {
    return <InviteJoinClient status="error" message={joinError} />;
  }

  redirect(`/?joined=${joinResult?.list_id ?? ""}`);
}
