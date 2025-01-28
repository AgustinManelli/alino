import { redirect } from "next/navigation";
import styles from "../(auth)/auth.module.css";
import { ButtonLink } from "@/components/ui/button-link";
import { AlinoLogo, HomeIcon } from "@/components/ui/icons/icons";
import { getSession } from "@/lib/auth/actions";
import pattern from "../../../public/pattern.svg";

export default async function UserUpdateDataLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const result = await getSession();
  if (result.error) {
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
