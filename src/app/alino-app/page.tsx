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
      <div
        style={{
          position: "absolute",
          backgroundColor: "rgb(100,100,100)",
          border: "solid #1c1c1c 2px",
          borderRadius: "10px",
          width: "fit-content",
          height: "fit-content",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
          bottom: "20px",
          right: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <form>
            <button
              formAction={signout}
              style={{
                borderRadius: "100%",
                width: "50px",
                height: "50px",
                border: "none",
                backgroundColor: "#fff",
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              {" "}
              salir{" "}
            </button>
          </form>
          <Link href={"/"}>
            <p
              style={{
                borderRadius: "100%",
                width: "50px",
                height: "50px",
                border: "none",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
              }}
            >
              home
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
