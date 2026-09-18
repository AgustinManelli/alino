import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next") ?? "/";

  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/";
  }

  const origin = requestUrl.origin;
  const targetBase = `${origin}/alino-app`;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user?.id) {
      const headerCountry =
        request.headers.get("x-vercel-ip-country") ||
        request.headers.get("cf-ipcountry") ||
        "AR";

      await supabase
        .from("user_private")
        .update({ country_code: headerCountry.toUpperCase() })
        .eq("user_id", data.user.id)
        .is("country_code", null);

      const finalPath = next === "/" ? "" : next;
      return NextResponse.redirect(`${targetBase}${finalPath}`);
    }

    const errorUrl = new URL(`${origin}/sign-in`);
    errorUrl.searchParams.set("error", error?.message || "auth_failed");
    return NextResponse.redirect(errorUrl);
  }

  const noCodeUrl = new URL(`${origin}/sign-in`);
  noCodeUrl.searchParams.set("error", "missing_code");
  return NextResponse.redirect(noCodeUrl);
}