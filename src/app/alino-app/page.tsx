import HomeManager from "./components/homeManager";
import styles from "./page.module.css";
import { readUserSession } from "@/lib/auth/actions";

export async function generateMetadata() {
  return {
    title: "Home",
  };
}

export default async function AlinoApp() {
  const { data } = await readUserSession();
  return (
    <div className={styles.container}>
      <HomeManager userName={data.session?.user.user_metadata?.name} />
    </div>
  );
}
