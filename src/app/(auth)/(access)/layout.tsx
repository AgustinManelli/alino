import { redirect } from "next/navigation";
import Image from "next/image";

import { getUser } from "@/lib/auth/actions";
import { ButtonLink } from "@/components/ui/button-link";

import pattern from "../../../../public/pattern.svg";
import navbar_blur from "../../../../public/auth_blur.webp";
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
            background="rgb(255, 255, 255)"
            hover="rgb(250, 250, 250)"
            letterColor="#000"
            to="/"
          >
            <HomeIcon
              style={{
                strokeWidth: "2",
                stroke: "#1c1c1c",
                width: "100%",
                height: "auto",
                fill: "none",
              }}
            />
          </ButtonLink>
        </div>
        <AlinoLogo style={{ height: "50px", minHeight: "50px" }} />
        <div className={styles.authForm}>
          <Image
            src={navbar_blur}
            alt=""
            priority
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "auto",
              opacity: 1,
              transform: "scaleX(-1)",
            }}
          />
          {children}
        </div>
      </section>
    </main>
  );
}
