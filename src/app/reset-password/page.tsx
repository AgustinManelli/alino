import { redirect } from "next/navigation";
import { readUserSession } from "../login/actions";
import styles from "../login/login.module.css";
import { ButtonComponent } from "@/components/buttonComponent/buttonComponent";
import { AlinoLogo, HomeIcon } from "../../lib/ui/icons";
import { ResetForm } from "./reset-form";

export default async function Login() {
  const { data } = await readUserSession();
  if (!data.session) {
    return redirect("/login");
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.backButton}>
          <ButtonComponent
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="/"
            strokeBorder={false}
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
        <ResetForm />
      </main>
    </div>
  );
}
