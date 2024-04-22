import { redirect } from "next/navigation";
import styles from "../(auth)/auth.module.css";
import { ButtonComponent } from "@/components/buttonComponent/buttonComponent";
import { AlinoLogo, HomeIcon } from "@/lib/ui/icons";
import { readUserSession } from "@/lib/auth/actions";

export default async function UserUpdateDataLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { data } = await readUserSession();
  if (!data.session) {
    return redirect("/sign-in");
  }

  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <div className={styles.backButton}>
          <ButtonComponent
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="/"
          >
            <HomeIcon
              style={{
                strokeWidth: "2",
                stroke: "#1c1c1c",
                width: "25px",
                height: "auto",
                fill: "none",
              }}
            />
          </ButtonComponent>
        </div>
        <AlinoLogo height="50px" />
        <div className={styles.form}>{children}</div>
      </section>
    </main>
  );
}
