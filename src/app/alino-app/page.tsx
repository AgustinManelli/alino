"use server";

import styles from "./page.module.css";
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
      <div className={styles.controls}>
        <div className={styles.controlsContainer}>
          <form>
            <button formAction={signout} className={styles.controlsButton}>
              {" "}
              <p>salir</p>{" "}
            </button>
          </form>
          <Link href={"/"} className={styles.controlsButton}>
            <p>home</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
