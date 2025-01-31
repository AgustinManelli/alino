import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    console.error("Código de restablecimiento no proporcionado");
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error(
        "Error intercambiando el código por sesión:",
        error.message
      );
      return NextResponse.redirect(`${origin}/sign-in?error=invalid_code`);
    }

    return NextResponse.redirect(`${origin}/reset-password`);
  } catch (err) {
    console.error("Error inesperado en el callback de autenticación:", err);
    return NextResponse.redirect(`${origin}/sign-in?error=unexpected`);
  }
}
