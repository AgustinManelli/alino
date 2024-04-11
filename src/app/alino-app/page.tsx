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
      <form>
        <button formAction={signout}> salirr </button>
      </form>
    </div>
  );
}
