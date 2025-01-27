import styles from "./page.module.css";
import Navbar from "@/components/home/navbar";
import { Header } from "@/components/home/header";
import Footer from "@/components/home/footer";
import Faq from "@/components/home/faq";
import { Cards } from "@/components/home/cards";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Header />
      <Cards />
      <Faq />
      <Footer />
    </main>
  );
}
