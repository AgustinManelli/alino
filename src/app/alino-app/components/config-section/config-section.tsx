import { User } from "@supabase/supabase-js";
import styles from "./config-section.module.css";
import { ConfigIcon } from "@/lib/ui/icons";

export default function ConfigSection({ user_data }: { user_data: User }) {
  return (
    <div className={styles.configSection}>
      <ConfigIcon
        style={{
          width: "25px",
          height: "auto",
          stroke: "#1c1c1c",
          strokeWidth: "2",
        }}
      />
    </div>
  );
}
