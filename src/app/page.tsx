"use client";

import styles from "./page.module.css";
import Navbar from "../components/home/navbar";
import Header from "../components/home/header";
import Content from "@/components/home/content";
import Footer from "@/components/home/footer";
import { useEffect } from "react";
import { useLoaderStore } from "@/store/useLoaderStore";

export default function Home() {
  const setLoading = useLoaderStore((state) => state.setLoading);
  useEffect(() => {
    setLoading(false);
  });
  return (
    <main className={styles.main}>
      <Navbar />
      <Header />
      <Content />
      <Footer />
    </main>
  );
}
