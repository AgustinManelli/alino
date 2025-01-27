import { redirect } from "next/navigation";

import { AlinoLogo, HomeIcon } from "@/components/ui/icons/icons";
import { readUserGetUser } from "@/lib/auth/actions";

import { ButtonLink } from "@/components/ui/button-link";

import pattern from "../../../public/pattern.svg";
import styles from "./auth.module.css";

export default async function authLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { error } = await readUserGetUser();
  if (!error) {
    return redirect("/alino-app");
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
          <ButtonLink
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
          </ButtonLink>
        </div>
        <AlinoLogo style={{ height: "50px" }} />
        <div className={styles.form}>{children}</div>
      </section>
    </main>
  );
}
