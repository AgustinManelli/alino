"use server";

import { redirect } from "next/navigation";
import { signout, readUserSession } from "@/lib/auth/actions";
import Link from "next/link";

export async function generateMetadata() {
  const { data } = await readUserSession();
  if (data.session) {
    const nameSession = data.session.user.user_metadata.name ?? "user";
    return {
      title: `alino app | ${nameSession}`,
    };
  }
  return {
    title: "alino app",
  };
}

export default async function AlinoApp() {
  const { data } = await readUserSession();

  if (!data.session) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <form>
        <button formAction={signout}> salir </button>
      </form>
      <Link href={"/"}>
        <p
          style={{
            width: "fit-content",
            border: "solid #000 1px",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          home
        </p>
      </Link>
      <p>
        Hola {data.session.user.user_metadata.name} ({data.session.user.email}),
        estás logeado correctamente.
      </p>
      <p>Tu id en nuestra base de datos es: {data.session.user.id}</p>
      <p>Tu access_token es: {data.session.access_token}</p>
    </div>
  );
}
