let initPromise: Promise<void> | null = null;

export const loadEmojiMartData = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!initPromise) {
    initPromise = Promise.all([
      import("emoji-mart"),
      import("./apple.json"),
    ])
      .then(([{ init }, dataModule]) => {
        init({
          data: dataModule.default || dataModule,
          set: "native",
        });
      })
      .catch((err) => {
        console.error("Error al cargar emoji-mart asíncronamente:", err);
        initPromise = null;
      });
  }

  return initPromise;
};
