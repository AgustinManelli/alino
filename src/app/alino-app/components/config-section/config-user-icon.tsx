"use client";

import { UserIcon } from "@/lib/ui/icons";

export default function ConfigUserIcon({
  userAvatarUrl,
}: {
  userAvatarUrl: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        backgroundImage: userAvatarUrl ? `url('${userAvatarUrl}')` : "",
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderRadius: "9px",
        backgroundColor: "#fff",
      }}
    >
      {!userAvatarUrl && (
        <UserIcon
          style={{
            stroke: "rgb(225, 225, 225)",
            strokeWidth: "1.5",
            width: "70%",
            height: "70%",
          }}
        />
      )}
    </div>
  );
}
