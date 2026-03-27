export const isHtmlContent = (content: string): boolean =>
  !!content && /^<[a-z][\s\S]*>/i.test(content.trim());

export const parseRichTextContent = (content: string): string => {
  if (!content) return "<p></p>";
  if (isHtmlContent(content)) return content;
  return content
    .split("\n")
    .map((line) =>
      line.trim()
        ? `<p>${line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")}</p>`
        : "<p><br /></p>"
    )
    .join("");
};

export const getRichTextExtensions = () => {
  return null;
};