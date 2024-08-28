import styles from "./page.module.css";
import Navbar from "../pages/home/navbar";
import Header from "../pages/home/header";
import Content from "@/pages/home/content";
import Footer from "@/pages/home/footer";
import Faq from "@/pages/home/faq";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Header />
      <Content />
      <Faq />
      <Footer />
    </main>
  );
}
