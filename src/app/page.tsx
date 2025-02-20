import Navbar from "@/components/pages/home/navbar";
import { Header } from "@/components/pages/home/header";
import Footer from "@/components/pages/home/footer";
import Faq from "@/components/pages/home/faq";
import { Cards } from "@/components/pages/home/cards";
import Image from "next/image";
import navbar_blur from "../../public/navbar_blur.webp";
// import { AppInformation } from "@/components/pages/home/app-information";

export default function Home() {
  return (
    <main style={{ overflow: "hidden", position: "relative" }}>
      <Image
        src={navbar_blur}
        alt=""
        priority
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          minWidth: "720px",
          height: "auto",
          opacity: 0.5,
        }}
      />
      <Navbar />
      <Header />
      <Cards />
      {/* <AppInformation /> */}
      <Faq />
      <Footer />
    </main>
  );
}
