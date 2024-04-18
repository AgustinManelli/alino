import { redirect } from "next/navigation";
import styles from "../sign-in/login.module.css";
import { ResetForm } from "./reset-form";
import { readUserSession } from "@/lib/auth/actions";

export default async function Login() {
  const { data } = await readUserSession();
  if (!data.session) {
    return redirect("/sign-in");
  }

  return (
    <div className={styles.container}>
      <ResetForm />
    </div>
  );
}
