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
      <p>Hola {data.session.user.email}, estás logeado correctamente.</p>
      <p>Tu id en nuestra base de datos es: {data.session.user.id}</p>
      <p>Tu access_token es: {data.session.access_token}</p>
    </div>
  );
}
