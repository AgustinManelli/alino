import { getUser } from "@/lib/api/actions";

import { AppContent } from "./AppContent";
import { TopBlurEffect } from "@/components/ui/top-blur-effect";

import styles from "./AlinoAppLayout.module.css";
// import { UserType } from "@/lib/schemas/todo-schema";

export default async function AlinoAppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const userPrivateResult = await getUser();

  // const user: UserType = {
  //   avatar_url: "",
  //   biography: "",
  //   created_at: "",
  //   display_name: "alino",
  //   updated_at: "",
  //   user_id: "ef917569-cfde-4e30-9c52-972fa5dc2d60",
  //   username: "alino",
  //   user_private: {
  //     initial_guide_show: true,
  //     initial_username_prompt_shown: false,
  //     preferences: {},
  //     updated_at: null,
  //     user_id: "ef917569-cfde-4e30-9c52-972fa5dc2d60",
  //     created_at: "",
  //   },
  // };

  return (
    <section className={styles.alinoAppLayoutContainer}>
      <TopBlurEffect />
      <div className={styles.appContentContainer}>
        <AppContent user={userPrivateResult.data?.user} />
        {children}
      </div>
    </section>
  );
}
