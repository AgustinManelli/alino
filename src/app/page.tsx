import styles from "./page.module.css";
import Navbar from "../components/home/navbar";
import Header from "../components/home/header";
import Content from "@/components/home/content";
import Footer from "@/components/home/footer";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Header />
      <Content />
      <Footer />
    </main>
  );
}
