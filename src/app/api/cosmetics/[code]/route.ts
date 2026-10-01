import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COSMETIC_CODE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,99}$/;

export async function GET(
  _request: Request,
  context: { params: { code: string } },
) {
  const { code } = context.params;
  if (!COSMETIC_CODE_PATTERN.test(code)) {
    return new NextResponse("Invalid cosmetic code", { status: 400 });
  }

  const storageUrl = new URL(
    `/storage/v1/object/public/cosmetics/${code}.svg`,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const response = await fetch(storageUrl, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return new NextResponse("Cosmetic asset not found", {
      status: response.status === 404 ? 404 : 502,
    });
  }

  const svg = await response.text();
  const normalizedSvg = svg
    .replace(/<svg(?![^>]*\bxmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"')
    .replace(/\sstyle="[^"]*"/, "");

  return new NextResponse(normalizedSvg, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="${code}.svg"`,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
