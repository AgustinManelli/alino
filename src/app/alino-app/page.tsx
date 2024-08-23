import styles from "./page.module.css";
import { readUserSession } from "@/lib/auth/actions";

export async function generateMetadata() {
  const { data, error } = await readUserSession();
  if (!error) {
    const nameSession = data.session?.user.user_metadata.name ?? "user";
    return {
      title: `alino app | ${nameSession}`,
    };
  }
  return {
    title: "alino app",
  };
}

export default async function AlinoApp() {
  const { data, error } = await readUserSession();
  return (
    <div
      style={{ width: "100%", height: "100%", padding: "25px 25px 25px 0px" }}
    >
      <p>hola {data.session?.user.user_metadata?.name} bienvenido a alino</p>
    </div>
  );
}
