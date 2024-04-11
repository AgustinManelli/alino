import { redirect } from "next/navigation";
import { readUserSession } from "../lib/actions";
import AuthForms from "./auth-forms";

export default async function Login() {
  const { data } = await readUserSession();
  if (data.session) {
    return redirect("/alino-app");
  }

  return (
    <>
      <AuthForms />
    </>
  );
}
