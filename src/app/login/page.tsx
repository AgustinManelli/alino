import { redirect } from "next/navigation";
import { readUserSession } from "../lib/actions";
import LoginForms from "./login-forms";

export default async function Login() {
  const { data } = await readUserSession();
  if (data.session) {
    return redirect("/alino-app");
  }

  return (
    <>
      <LoginForms />;
    </>
  );
}
