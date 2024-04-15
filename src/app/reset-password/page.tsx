import { redirect } from "next/navigation";
import { readUserSession } from "@/lib/auth/actions";
import styles from "../sign-in/login.module.css";
import { ResetForm } from "./reset-form";
import { FormContainer } from "@/components/forms/form-container";

export default async function Login() {
  const { data } = await readUserSession();
  if (!data.session) {
    return redirect("/sign-in");
  }

  return (
    <div className={styles.container}>
      <FormContainer>
        <ResetForm />
      </FormContainer>
    </div>
  );
}
