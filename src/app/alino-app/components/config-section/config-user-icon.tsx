"use client";

export default function ConfigUserIcon({
  userAvatarUrl,
}: {
  userAvatarUrl: string;
}) {
  return (
    <div
      style={{
        backgroundImage: `url('${userAvatarUrl}')`,
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderRadius: "9px",
      }}
    ></div>
  );
}
