"use server";

import styles from "./page.module.css";
import { redirect } from "next/navigation";
import { signout, readUserSession } from "@/lib/auth/actions";
import Link from "next/link";
import Todo from "./components/todo/todo";

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
    <div
      style={{ width: "100%", height: "100%", padding: "25px 25px 25px 0px" }}
    >
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
      <Todo />
    </div>
  );
}
