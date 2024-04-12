import { redirect } from "next/navigation";
import { signout } from "../login/actions";
import { readUserSession } from "../../lib/actions";
import Link from "next/link";

export default async function AlinoApp() {
  const { data } = await readUserSession();

  if (!data.session) {
    return redirect("/login");
  }

  return (
    <div>
      <form>
        <button formAction={signout}> salir </button>
      </form>
      <Link href={"/"}>
        <p style={{ backgroundColor: "red", width: "fit-content" }}>home</p>
      </Link>
    </div>
  );
}
