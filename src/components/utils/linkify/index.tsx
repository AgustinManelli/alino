import React from "react";
import { Link as LinkIcon } from "@/components/ui/icons/icons";
import styles from "./linkify.module.css";

export function shortenUrl(rawUrl: string, maxChars = 36) {
  const trimmed = rawUrl.trim();
  try {
    const hasScheme = /^https?:\/\//i.test(trimmed);
    const candidate = hasScheme ? trimmed : `https://${trimmed}`;

    if (/^\s*(javascript|data|vbscript):/i.test(candidate))
      throw new Error("invalid scheme");

    const u = new URL(candidate);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname + u.search + u.hash;
    if (path === "/" || path === "") return host;
    const shortPath =
      path.length > maxChars
        ? path.slice(0, Math.max(6, maxChars - 3)) + "..."
        : path;
    return `${host}${shortPath.startsWith("/") ? "" : "/"}${shortPath}`;
  } catch {
    if (trimmed.length <= maxChars) return trimmed;
    return trimmed.slice(0, maxChars - 3) + "...";
  }
}

export function linkifyWithIcon(
  text: string,
  maxLabelChars = 30
): React.ReactNode[] {
  const pattern = /(https?:\/\/[^\s\[\]]+|www\.[^\s\[\]]+)(?:\[([^\]]+)\])?/gi;
  const nodes: Array<string | JSX.Element> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index;
    const end = pattern.lastIndex;

    if (start > lastIndex) nodes.push(text.slice(lastIndex, start));

    const raw = match[1];
    const labelGroup = match[2];
    let label = labelGroup ? labelGroup.trim() : shortenUrl(raw, maxLabelChars);

    if (label.length > maxLabelChars) {
      label = label.slice(0, maxLabelChars) + "…";
    }

    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    if (/^\s*(javascript|data|vbscript):/i.test(candidate)) {
      nodes.push(raw);
      lastIndex = end;
      continue;
    }

    const href = candidate;

    nodes.push(
      <a
        key={`link-${start}-${idx}-${raw}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkBox}
        title={href}
        onClick={(e) => e.stopPropagation()}
      >
        <LinkIcon
          style={{
            width: "14px",
            height: "auto",
            stroke: "currentColor",
            strokeWidth: 2,
          }}
          aria-hidden
        />
        <span className={styles.linkText}>{label}</span>
      </a>
    );

    lastIndex = end;
    idx++;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return nodes;
}
