import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize:   (size: string) => ReturnType;
      unsetFontSize: ()             => ReturnType;
    };
  }
}

export const FontSizeExtension = Extension.create({
  name: "fontSize",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML:  (el)    => el.style.fontSize?.replace(/['"]+/g, "") ?? null,
            renderHTML: (attrs) => attrs.fontSize
              ? { style: `font-size: ${attrs.fontSize}` }
              : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      // TipTap infiere los tipos desde Commands<ReturnType>, sin `any`
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});