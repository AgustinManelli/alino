import Image from "next/image";

import { ButtonLink } from "@/components/ui/button-link";

import { AlinoLogo, HomeIcon } from "@/components/ui/icons/icons";
import styles from "./Layout.module.css";

export default function AuthLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <main className={styles.layout}>
      <section className={styles.contentContainer}>
        <div className={styles.backLinkContainer}>
          <ButtonLink to="alino.online">
            <HomeIcon
              style={{
                strokeWidth: "2",
                stroke: "var(--text)",
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
            src="/auth_blur.webp"
            alt="Imagen de fondo"
            priority
            width={16}
            height={9}
            className={styles.backgroundBlur}
          />
          {children}
        </div>
      </section>
    </main>
  );
}
