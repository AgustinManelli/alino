import styles from "./page.module.css";
import Navbar from "../pages/home/navbar";
import { Header } from "../pages/home/header";
import Footer from "@/pages/home/footer";
import Faq from "@/pages/home/faq";
import { Cards } from "@/pages/home/cards";

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
