import styles from "./ListInformation.module.css";
import { UserWithMembershipRole } from "./index";

interface MemberRowProps {
  user: UserWithMembershipRole;
}

export function MemberRow({ user }: MemberRowProps) {
  const joinDate = new Date(user.shared_since).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedRole =
    user.role === "owner"
      ? "Propietario"
      : user.role === "admin"
        ? "Administrador"
        : user.role === "editor"
          ? "Miembro"
          : "Invitado";
  console.log(user);
  return (
    <div className={styles.memberRowContainer}>
      <div className={styles.memberRow}>
        <img
          src={user.avatar_url || "/default-avatar.png"}
          alt={user.display_name || "Avatar"}
          className={styles.avatar}
        />
        <div className={styles.userInfo}>
          <p className={styles.displayName}>
            {user.display_name}{" "}
            <span style={{ opacity: 0.2, fontWeight: "200" }}>
              ({formattedRole})
            </span>
          </p>
          <p className={styles.username}>@{user.username}</p>
        </div>
      </div>
      <p className={styles.joinDate}>Miembro desde: {joinDate}</p>
    </div>
  );
}
