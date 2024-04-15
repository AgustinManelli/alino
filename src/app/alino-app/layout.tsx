import Navbar from "./components/navbar/navbar";

export default function appLayout({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        backgroundColor: "rgb(240, 240, 240)",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Navbar />
      {children}
    </section>
  );
}
