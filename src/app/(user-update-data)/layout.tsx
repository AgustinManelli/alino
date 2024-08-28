import { redirect } from "next/navigation";
import styles from "../(auth)/auth.module.css";
import { ButtonComp } from "@/components";
import { AlinoLogo, HomeIcon } from "@/lib/ui/icons";
import { readUserSession } from "@/lib/auth/actions";
import pattern from "../../../public/pattern.svg";

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
    <main
      className={styles.main}
      style={{
        backgroundImage: `url(${pattern.src})`,
        backgroundRepeat: "repeat",
        backgroundPosition: "top left",
        backgroundSize: "200px",
      }}
    >
      <section className={styles.container}>
        <div className={styles.backButton}>
          <ButtonComp
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
          </ButtonComp>
        </div>
        <AlinoLogo style={{ height: "50px" }} />
        <div className={styles.form}>{children}</div>
      </section>
    </main>
  );
}
