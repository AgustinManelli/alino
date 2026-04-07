"use client";

import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { Editor } from "@tiptap/react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./RichTextToolbar.module.css";

const BulletListIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const OrderedListIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <polyline points="3.5,5 5,4 5,8" strokeWidth={1.8} />
    <path d="M3.5 11h2a.5.5 0 0 1 0 1H4a.5.5 0 0 0 0 1H5.5" strokeWidth={1.8} />
    <path d="M3.5 17h2l-2 3h2" strokeWidth={1.8} />
  </svg>
);

const AlignLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </svg>
);

const AlignJustifyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const HighlightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11-6 6v3h9l3-3" />
    <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
  </svg>
);

const LinkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UnlinkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18.84 12.25 1.72-1.71h-.01a5.001 5.001 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="m5.17 11.67-1.71 1.71a5.001 5.001 0 0 0 7.07 7.07l1.71-1.71" />
    <line x1="8" y1="2" x2="8" y2="5" />
    <line x1="2" y1="8" x2="5" y2="8" />
    <line x1="16" y1="19" x2="16" y2="22" />
    <line x1="19" y1="16" x2="22" y2="16" />
  </svg>
);

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32"];

const FONT_FAMILIES = [
  { label: "Predeter.", value: "inherit" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Times", value: "'Times New Roman', Times, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet", value: "'Trebuchet MS', sans-serif" },
  { label: "Mono", value: "'Courier New', monospace" },
  { label: "Consolas", value: "Consolas, monospace" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Georgia", value: "Georgia, serif" },
];

const TEXT_COLORS = [
  { label: "Default", value: null },
  { label: "Rojo", value: "#ef4444" },
  { label: "Naranja", value: "#f97316" },
  { label: "Amarillo", value: "#ca8a04" },
  { label: "Verde", value: "#16a34a" },
  { label: "Azul", value: "#2563eb" },
  { label: "Violeta", value: "#7c3aed" },
  { label: "Rosa", value: "#db2777" },
  { label: "Gris", value: "#6b7280" },
];

const HIGHLIGHT_COLORS = [
  { label: "Ninguno", value: null },
  { label: "Amarillo", value: "#fef08a" },
  { label: "Verde", value: "#bbf7d0" },
  { label: "Azul", value: "#bfdbfe" },
  { label: "Violeta", value: "#ddd6fe" },
  { label: "Rosa", value: "#fecaca" },
  { label: "Naranja", value: "#fed7aa" },
];

const ALIGNMENTS = [
  { value: "left", label: "Izquierda", Icon: AlignLeftIcon },
  { value: "center", label: "Centro", Icon: AlignCenterIcon },
  { value: "right", label: "Derecha", Icon: AlignRightIcon },
  { value: "justify", label: "Justificado", Icon: AlignJustifyIcon },
] as const;

const popoverMotion = {
  initial: { opacity: 0, scale: 0.9, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -4 },
  transition: { duration: 0.13 },
} as const;

const fontFamilyStyle = { maxWidth: "82px" };
const fontSizeStyle = { maxWidth: "52px" };

interface SwatchProps {
  label: string;
  value: string | null;
  onSelect: (val: string | null) => void;
}

const ColorSwatch = memo(function ColorSwatch({
  label,
  value,
  onSelect,
}: SwatchProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onSelect(value);
    },
    [value, onSelect],
  );

  const style = useMemo(
    () => ({
      backgroundColor: value ?? "transparent",
      border: !value ? "1.5px dashed var(--icon-color)" : "none",
      opacity: !value ? 0.5 : 1,
    }),
    [value],
  );

  return (
    <button
      className={styles.swatch}
      style={style}
      title={label}
      onMouseDown={handleMouseDown}
    />
  );
});

interface RichTextToolbarProps {
  editor: Editor | null;
}

export const RichTextToolbar = memo(function RichTextToolbar({
  editor,
}: RichTextToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setRerender] = useState(0);
  const [colorOpen, setColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const forceUpdate = () => setRerender((v) => v + 1);
    editor.on("transaction", forceUpdate);
    editor.on("selectionUpdate", forceUpdate);
    return () => {
      editor.off("transaction", forceUpdate);
      editor.off("selectionUpdate", forceUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (!colorOpen && !highlightOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setColorOpen(false);
        setHighlightOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [colorOpen, highlightOpen]);

  const toggleBold = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().toggleBold().run();
    },
    [editor],
  );

  const toggleItalic = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().toggleItalic().run();
    },
    [editor],
  );

  const toggleUnderline = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().toggleUnderline().run();
    },
    [editor],
  );

  const toggleStrike = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().toggleStrike().run();
    },
    [editor],
  );

  const toggleBulletList = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().toggleBulletList().run();
    },
    [editor],
  );

  const toggleOrderedList = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().toggleOrderedList().run();
    },
    [editor],
  );

  const unsetLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().unsetLink().run();
    },
    [editor],
  );

  const handleAlign = useCallback(
    (align: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().setTextAlign(align).run();
    },
    [editor],
  );

  const handleFontFamily = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === "inherit") {
        editor?.chain().focus().unsetFontFamily().run();
      } else {
        editor?.chain().focus().setFontFamily(e.target.value).run();
      }
    },
    [editor],
  );

  const handleFontSize = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      editor?.chain().focus().setFontSize(`${e.target.value}px`).run();
    },
    [editor],
  );

  const setLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!editor) return;
      const previousUrl = editor.getAttributes("link").href;
      const url = window.prompt("Ingresa la URL del enlace:", previousUrl);

      if (url === null) return;

      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
    [editor],
  );

  const toggleColorOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setColorOpen((v) => !v);
    setHighlightOpen(false);
  }, []);

  const toggleHighlightOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHighlightOpen((v) => !v);
    setColorOpen(false);
  }, []);

  const handleSetColor = useCallback(
    (val: string | null) => {
      if (!editor) return;
      if (val) editor.chain().focus().setColor(val).run();
      else editor.chain().focus().unsetColor().run();
      setColorOpen(false);
    },
    [editor],
  );

  const handleSetHighlight = useCallback(
    (val: string | null) => {
      if (!editor) return;
      if (val) editor.chain().focus().setHighlight({ color: val }).run();
      else editor.chain().focus().unsetHighlight().run();
      setHighlightOpen(false);
    },
    [editor],
  );

  const stopPropagation = useCallback(
    (e: React.MouseEvent | React.UIEvent) => e.stopPropagation(),
    [],
  );

  if (!editor) return null;

  const activeColor = editor.getAttributes("textStyle").color as
    | string
    | undefined;

  const activeHighlight = editor.isActive("highlight")
    ? (editor.getAttributes("highlight").color as string | undefined)
    : undefined;

  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined)?.replace(
      "px",
      "",
    ) ?? "14";

  const currentFontFamily =
    (editor.getAttributes("textStyle").fontFamily as string | undefined) ??
    "inherit";

  return (
    <div
      className={styles.toolbar}
      onMouseDown={stopPropagation}
      ref={containerRef}
    >
      <button
        className={`${styles.btn} ${editor.isActive("bold") ? styles.active : ""}`}
        onMouseDown={toggleBold}
        title="Negrita (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        className={`${styles.btn} ${editor.isActive("italic") ? styles.active : ""}`}
        onMouseDown={toggleItalic}
        title="Cursiva (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        className={`${styles.btn} ${editor.isActive("underline") ? styles.active : ""}`}
        onMouseDown={toggleUnderline}
        title="Subrayado (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <button
        className={`${styles.btn} ${editor.isActive("strike") ? styles.active : ""}`}
        onMouseDown={toggleStrike}
        title="Tachado"
      >
        <s>S</s>
      </button>

      <button
        className={`${styles.btn} ${editor.isActive("link") ? styles.active : ""}`}
        onMouseDown={setLink}
        title="Añadir/Editar Enlace"
      >
        <LinkIcon />
      </button>

      {editor.isActive("link") && (
        <button
          className={styles.btn}
          onMouseDown={unsetLink}
          title="Quitar enlace"
        >
          <UnlinkIcon />
        </button>
      )}

      <div className={styles.sep} />

      <select
        className={styles.select}
        style={fontFamilyStyle}
        value={currentFontFamily}
        onMouseDown={stopPropagation}
        onChange={handleFontFamily}
        title="Fuente"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        style={fontSizeStyle}
        value={currentFontSize}
        onMouseDown={stopPropagation}
        onChange={handleFontSize}
        title="Tamaño"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className={styles.sep} />

      <div className={styles.popoverWrapper}>
        <button
          className={`${styles.colorTriggerBtn} ${activeColor ? styles.active : ""}`}
          onMouseDown={toggleColorOpen}
          title="Color de texto"
        >
          <span className={styles.colorLabel}>A</span>
          <span
            className={styles.colorBar}
            style={{ backgroundColor: activeColor ?? "var(--text)" }}
          />
        </button>

        <AnimatePresence>
          {colorOpen && (
            <motion.div
              className={styles.popover}
              initial={popoverMotion.initial}
              animate={popoverMotion.animate}
              exit={popoverMotion.exit}
              transition={popoverMotion.transition}
              onMouseDown={stopPropagation}
            >
              {TEXT_COLORS.map((c) => (
                <ColorSwatch
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  onSelect={handleSetColor}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.popoverWrapper}>
        <button
          className={`${styles.colorTriggerBtn} ${editor.isActive("highlight") ? styles.active : ""}`}
          onMouseDown={toggleHighlightOpen}
          title="Resaltar texto"
        >
          <span className={styles.iconWrapper}>
            <HighlightIcon />
          </span>
          <span
            className={styles.colorBar}
            style={{
              backgroundColor: activeHighlight ?? "transparent",
              border: !activeHighlight ? "1px solid var(--icon-color)" : "none",
              opacity: !activeHighlight ? 0.3 : 1,
            }}
          />
        </button>

        <AnimatePresence>
          {highlightOpen && (
            <motion.div
              className={styles.popover}
              initial={popoverMotion.initial}
              animate={popoverMotion.animate}
              exit={popoverMotion.exit}
              transition={popoverMotion.transition}
              onMouseDown={stopPropagation}
            >
              {HIGHLIGHT_COLORS.map((h) => (
                <ColorSwatch
                  key={h.label}
                  label={h.label}
                  value={h.value}
                  onSelect={handleSetHighlight}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.sep} />

      <button
        className={`${styles.btn} ${editor.isActive("bulletList") ? styles.active : ""}`}
        onMouseDown={toggleBulletList}
        title="Lista de viñetas"
      >
        <BulletListIcon />
      </button>
      <button
        className={`${styles.btn} ${editor.isActive("orderedList") ? styles.active : ""}`}
        onMouseDown={toggleOrderedList}
        title="Lista numerada"
      >
        <OrderedListIcon />
      </button>

      <div className={styles.sep} />

      {ALIGNMENTS.map(({ value, label, Icon }) => (
        <button
          key={value}
          className={`${styles.btn} ${editor.isActive({ textAlign: value }) ? styles.active : ""}`}
          onMouseDown={handleAlign(value)}
          title={label}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
});
