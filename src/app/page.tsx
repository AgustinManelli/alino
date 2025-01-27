import Navbar from "@/components/pages/home/navbar";
import { Header } from "@/components/pages/home/header";
import Footer from "@/components/pages/home/footer";
import Faq from "@/components/pages/home/faq";
import { Cards } from "@/components/pages/home/cards";

export default function Home() {
  return (
    <main style={{ overflow: "hidden" }}>
      <Navbar />
      <Header />
      <Cards />
      <Faq />
      <Footer />
    </main>
  );
}
