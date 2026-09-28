export default function AlinoAppLoading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--background-alino-app, #121316)",
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes alino-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "2.5px solid rgba(120, 120, 120, 0.15)",
          borderTopColor: "#008FFD",
          animation: "alino-spin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        }}
      />
    </div>
  );
}
