"use client";

import { useCallback, useMemo, memo, useRef } from "react";
import { Editor, useEditorState } from "@tiptap/react";

import { TextColorPicker } from "./TextColorPicker";
import { HighlightColorPicker } from "./HighlightColorPicker";

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

const FONT_SIZES = [
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
  "32",
] as const;

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
] as const;

const ALIGNMENTS = [
  { value: "left", label: "Izquierda", Icon: AlignLeftIcon },
  { value: "center", label: "Centro", Icon: AlignCenterIcon },
  { value: "right", label: "Derecha", Icon: AlignRightIcon },
  { value: "justify", label: "Justificado", Icon: AlignJustifyIcon },
] as const;

type AlignValue = (typeof ALIGNMENTS)[number]["value"];

const FONT_FAMILY_STYLE = { maxWidth: "82px" } as const;
const FONT_SIZE_STYLE = { maxWidth: "52px" } as const;

interface RichTextToolbarProps {
  editor: Editor | null;
}

export const RichTextToolbar = memo(function RichTextToolbar({
  editor,
}: RichTextToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editorState = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        isBold: e.isActive("bold"),
        isItalic: e.isActive("italic"),
        isUnderline: e.isActive("underline"),
        isStrike: e.isActive("strike"),
        isLink: e.isActive("link"),
        isBulletList: e.isActive("bulletList"),
        isOrderedList: e.isActive("orderedList"),
        isHighlight: e.isActive("highlight"),
        textAlign: {
          left: e.isActive({ textAlign: "left" }),
          center: e.isActive({ textAlign: "center" }),
          right: e.isActive({ textAlign: "right" }),
          justify: e.isActive({ textAlign: "justify" }),
        },
        activeColor: e.getAttributes("textStyle").color as string | undefined,
        activeHighlight: e.isActive("highlight")
          ? (e.getAttributes("highlight").color as string | undefined)
          : undefined,
        currentFontSize:
          (
            e.getAttributes("textStyle").fontSize as string | undefined
          )?.replace("px", "") ?? "14",
        currentFontFamily:
          (e.getAttributes("textStyle").fontFamily as string | undefined) ??
          "inherit",
      };
    },
  });

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

  const setLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!editor) return;
      const previousUrl = editor.getAttributes("link").href as
        | string
        | undefined;
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

  const unsetLink = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      editor?.chain().focus().unsetLink().run();
    },
    [editor],
  );

  const alignHandlers = useMemo<
    Record<AlignValue, (e: React.MouseEvent) => void>
  >(
    () =>
      Object.fromEntries(
        ALIGNMENTS.map(({ value }) => [
          value,
          (e: React.MouseEvent) => {
            e.preventDefault();
            editor?.chain().focus().setTextAlign(value).run();
          },
        ]),
      ) as Record<AlignValue, (e: React.MouseEvent) => void>,
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

  const handleSetColor = useCallback(
    (val: string | null) => {
      if (!editor) return;
      if (val) editor.chain().focus().setColor(val).run();
      else editor.chain().focus().unsetColor().run();
    },
    [editor],
  );

  const handleSetHighlight = useCallback(
    (val: string | null) => {
      if (!editor) return;
      if (val) editor.chain().focus().setHighlight({ color: val }).run();
      else editor.chain().focus().unsetHighlight().run();
    },
    [editor],
  );

  const stopPropagation = useCallback(
    (e: React.MouseEvent | React.UIEvent) => e.stopPropagation(),
    [],
  );

  if (!editor || !editorState) return null;

  const {
    isBold,
    isItalic,
    isUnderline,
    isStrike,
    isLink,
    isBulletList,
    isOrderedList,
    isHighlight,
    textAlign,
    activeColor,
    activeHighlight,
    currentFontSize,
    currentFontFamily,
  } = editorState;

  return (
    <div
      className={styles.toolbar}
      onMouseDown={stopPropagation}
      ref={containerRef}
    >
      <button
        className={`${styles.btn} ${isBold ? styles.active : ""}`}
        onMouseDown={toggleBold}
        title="Negrita (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        className={`${styles.btn} ${isItalic ? styles.active : ""}`}
        onMouseDown={toggleItalic}
        title="Cursiva (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        className={`${styles.btn} ${isUnderline ? styles.active : ""}`}
        onMouseDown={toggleUnderline}
        title="Subrayado (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <button
        className={`${styles.btn} ${isStrike ? styles.active : ""}`}
        onMouseDown={toggleStrike}
        title="Tachado"
      >
        <s>S</s>
      </button>

      <button
        className={`${styles.btn} ${isLink ? styles.active : ""}`}
        onMouseDown={setLink}
        title="Añadir/Editar Enlace"
      >
        <LinkIcon />
      </button>
      {isLink && (
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
        style={FONT_FAMILY_STYLE}
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
        style={FONT_SIZE_STYLE}
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

      <TextColorPicker activeColor={activeColor} onSetColor={handleSetColor} />

      <HighlightColorPicker
        activeHighlight={activeHighlight}
        onSetHighlight={handleSetHighlight}
      />

      <div className={styles.sep} />

      <button
        className={`${styles.btn} ${isBulletList ? styles.active : ""}`}
        onMouseDown={toggleBulletList}
        title="Lista de viñetas"
      >
        <BulletListIcon />
      </button>
      <button
        className={`${styles.btn} ${isOrderedList ? styles.active : ""}`}
        onMouseDown={toggleOrderedList}
        title="Lista numerada"
      >
        <OrderedListIcon />
      </button>

      <div className={styles.sep} />

      {ALIGNMENTS.map(({ value, label, Icon }) => (
        <button
          key={value}
          className={`${styles.btn} ${textAlign[value] ? styles.active : ""}`}
          onMouseDown={alignHandlers[value]}
          title={label}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
});
