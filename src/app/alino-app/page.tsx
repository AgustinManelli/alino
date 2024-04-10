import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";
import { signout } from "../login/actions";
import { readUserSession } from "../lib/actions";

export default async function AlinoApp() {
  const { data } = await readUserSession();

  if (!data.session) {
    return redirect("/login");
  }

  return (
    <div>
      {/* <p>Hello {data.user.email}</p>
      <p>{data.user.updated_at}</p> */}
      <form>
        <button formAction={signout}> salir </button>
      </form>
      {/* <form>
        <input
          type="number"
          name="number"
          id="number"
          placeholder="password update"
        />
        <button formAction={updatePhone}>update</button>
      </form> */}
    </div>
  );
}
