import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/";

  //Prevención de ataques "Open Redirect"
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/"; 
  }

  //Normalización de la URL base
  const rawBaseURL =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000/alino-app"
      : "https://alinoapp.vercel.app/alino-app");

  //Removemos un posible slash final
  const baseURL = rawBaseURL.replace(/\/$/, "");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const finalPath = next === "/" ? "" : next;
      return NextResponse.redirect(`${baseURL}${finalPath}`);
    }

    //Uso de la API URL para construir los parámetros de consulta de forma segura
    const errorUrl = new URL(`${baseURL}/sign-in`);
    errorUrl.searchParams.set("error", error.message || "auth_failed");
    return NextResponse.redirect(errorUrl);
  }

  //Manejo explícito de la ausencia del parámetro 'code'
  const noCodeUrl = new URL(`${baseURL}/sign-in`);
  noCodeUrl.searchParams.set("error", "missing_code");
  return NextResponse.redirect(noCodeUrl);
}