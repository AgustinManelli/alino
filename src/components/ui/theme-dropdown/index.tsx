"use client";

import React, { useEffect, useState } from "react";
import { Dropdown } from "../Dropdown";
import useThemeStore from "@/store/useThemeStore";
import { SunIcon, MoonIcon, ComputerIcon } from "./ThemeIcons";
import styles from "./ThemeDropdown.module.css";
import { LoadingIcon } from "../icons/icons";

export const ThemeDropdown = () => {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme } =
    useThemeStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ThemeIconTrigger = () => {
    if (!mounted)
      return (
        <div className={styles.triggerIcon}>
          <LoadingIcon
            style={{
              width: "15px",
              height: "auto",
              stroke: "var(--text)",
              strokeWidth: "3",
              opacity: 0.3,
            }}
          />
        </div>
      );

    switch (theme) {
      case "light":
        return (
          <div className={styles.triggerIcon}>
            <SunIcon isLight={true} />
          </div>
        );
      case "dark":
        return (
          <div className={styles.triggerIcon}>
            <MoonIcon isDark={true} />
          </div>
        );
      default:
        return (
          <div className={styles.triggerIcon}>
            <ComputerIcon />
          </div>
        );
    }
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label="Seleccionar tema"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "40px",
          height: "40px",
          padding: "0",
          backgroundColor: "var(--background-container)",
        }}
        bgColor="var(--background-container)"
        hoverColor="var(--background-over-container-solid)"
      >
        <ThemeIconTrigger />
      </Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Item
          onClick={setLightTheme}
          className={theme === "light" ? styles.active : ""}
        >
          <div className={styles.itemContent}>
            <div className={styles.iconContainer}>
              <SunIcon isLight={theme === "light"} />
            </div>
            <span>Claro</span>
          </div>
        </Dropdown.Item>
        <Dropdown.Item
          onClick={setDarkTheme}
          className={theme === "dark" ? styles.active : ""}
        >
          <div className={styles.itemContent}>
            <div className={styles.iconContainer}>
              <MoonIcon isDark={theme === "dark"} />
            </div>
            <span>Oscuro</span>
          </div>
        </Dropdown.Item>
        <Dropdown.Item
          onClick={setSystemTheme}
          className={theme === "system" ? styles.active : ""}
        >
          <div className={styles.itemContent}>
            <div className={styles.iconContainer}>
              <ComputerIcon className={styles.icon} />
            </div>
            <span>Sistema</span>
          </div>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  );
};
