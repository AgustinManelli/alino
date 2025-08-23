import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const next = searchParams.get("next") ?? "/";

  const baseURL =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://app.alino.online");

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${baseURL}${next}`);
    }
    const errorMessage = encodeURIComponent(error.message || "auth_failed");
    return NextResponse.redirect(`${baseURL}/sign-in?error=${errorMessage}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${baseURL}`);
}
