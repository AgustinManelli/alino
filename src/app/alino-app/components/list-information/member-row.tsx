import { Skeleton } from "@/components/ui/skeleton";
import styles from "./ListInformation.module.css";
import { UserWithMembershipRole } from "./index";

interface MemberRowProps {
  user: UserWithMembershipRole | null;
}

export function MemberRow({ user }: MemberRowProps) {
  const joinDate =
    user &&
    new Date(user.shared_since).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formattedRole =
    user?.role === "owner"
      ? "Propietario"
      : user?.role === "admin"
        ? "Administrador"
        : user?.role === "editor"
          ? "Miembro"
          : "Invitado";
  return (
    <div className={styles.memberRowContainer}>
      <div className={styles.memberRow}>
        {user ? (
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.display_name || "Avatar"}
            className={styles.avatar}
          />
        ) : (
          <Skeleton
            style={{
              width: "40px",
              height: "auto",
              borderRadius: "100%",
              aspectRatio: "1 / 1",
            }}
          />
        )}
        <div className={styles.userInfo}>
          {user ? (
            <p className={styles.displayName}>
              {user.display_name}{" "}
              <span style={{ opacity: 0.2, fontWeight: "200" }}>
                ({formattedRole})
              </span>
            </p>
          ) : (
            <Skeleton
              style={{ width: "80%", height: "17px", borderRadius: "5px" }}
            />
          )}
          {user ? (
            <p className={styles.username}>@{user.username}</p>
          ) : (
            <Skeleton
              style={{
                width: "50%",
                height: "17px",
                borderRadius: "5px",
                marginTop: "5px",
              }}
            />
          )}
        </div>
      </div>
      {user && <p className={styles.joinDate}>Miembro desde: {joinDate}</p>}
    </div>
  );
}
