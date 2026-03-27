import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

interface SmartDateHighlighterOptions {
  textToHighlight: string | null;
}

export const SmartDateHighlighter = Extension.create<SmartDateHighlighterOptions>({
  name: "smartDateHighlighter",

  addOptions() {
    return {
      textToHighlight: null,
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey("smartDateHighlighter");

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return {
              decorations: DecorationSet.empty,
              textToHighlight: null as string | null,
            };
          },
          apply: (tr, oldState) => {
            const meta = tr.getMeta("smartDateHighlight");
            const textToHighlight = meta !== undefined ? meta : oldState.textToHighlight;

            if (!textToHighlight) {
              return { decorations: DecorationSet.empty, textToHighlight: null };
            }

            if (meta === undefined && !tr.docChanged) {
              return oldState;
            }

            const decorations: Decoration[] = [];
            tr.doc.descendants((node, pos) => {
              if (node.isText && node.text) {
                const textLower = node.text.toLowerCase();
                const searchLower = textToHighlight.toLowerCase();
                const idx = textLower.indexOf(searchLower);
                if (idx !== -1) {
                  decorations.push(
                    Decoration.inline(
                      pos + idx,
                      pos + idx + searchLower.length,
                      {
                        class: "smart-date-highlight",
                      }
                    )
                  );
                }
              }
            });

            return {
              decorations: DecorationSet.create(tr.doc, decorations),
              textToHighlight,
            };
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state)?.decorations || DecorationSet.empty;
          },
        },
      }),
    ];
  },
});
