import Image from "next/image";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { ThemeDropdown } from "@/components/ui/theme-dropdown";

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
          <ButtonLink
            href={process.env.NEXT_PUBLIC_LANDING_URL || "https://usealino.com"}
            ariaLabel="Volver a la página principal"
            background="var(--background-container)"
            hoverColor="var(--background-over-container-solid)"
          >
            <HomeIcon
              style={{
                strokeWidth: "1.5",
                stroke: "var(--icon-color)",
                width: "100%",
                height: "auto",
                fill: "none",
              }}
            />
          </ButtonLink>
        </div>
        <div className={styles.themeSelectorContainer}>
          <ThemeDropdown />
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
