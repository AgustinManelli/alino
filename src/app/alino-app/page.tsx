import HomeManager from "./components/homeManager";
import styles from "./page.module.css";
import { getSession } from "@/lib/auth/actions";

export async function generateMetadata() {
  return {
    title: "Home",
  };
}

export default async function AlinoApp() {
  const { data } = await getSession();
  return (
    <div className={styles.container}>
      <HomeManager userName={data?.session?.user.user_metadata?.name} />
    </div>
  );
}
