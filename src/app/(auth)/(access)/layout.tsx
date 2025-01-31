import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth/actions";
import { ButtonLink } from "@/components/ui/button-link";

import pattern from "../../../../public/pattern.svg";
import { AlinoLogo, HomeIcon } from "@/components/ui/icons/icons";
import styles from "./auth.module.css";

export default async function AuthLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { error } = await getUser();

  if (!error) {
    return redirect("/alino-app");
  }

  return (
    <main
      className={styles.layout}
      style={{
        backgroundImage: `url(${pattern.src})`,
      }}
    >
      <section className={styles.contentContainer}>
        <div className={styles.backLinkContainer}>
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
        <AlinoLogo style={{ height: "50px", minHeight: "50px" }} />
        <div className={styles.authForm}>{children}</div>
      </section>
    </main>
  );
}
