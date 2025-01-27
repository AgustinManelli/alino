import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // eslint-disable-next-line no-console
  console.error("Codigo de reestablecimiento inválido");

  return NextResponse.redirect(`${origin}/sign-in`);
}
