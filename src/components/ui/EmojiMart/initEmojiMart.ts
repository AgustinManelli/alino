let initPromise: Promise<any> | null = null;
let cachedData: any = null;

export const loadEmojiMartData = (immediate = false): Promise<any> => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (cachedData) {
    return Promise.resolve(cachedData);
  }

  if (!initPromise || (immediate && !cachedData)) {
    initPromise = new Promise((resolve) => {
      const execute = () => {
        Promise.all([
          import("emoji-mart"),
          import("./apple.json"),
        ])
          .then(([{ init }, dataModule]) => {
            cachedData = dataModule.default || dataModule;
            try {
              init({
                data: cachedData,
                set: "native",
              });
            } catch (initErr) {
              console.warn("emoji-mart init error:", initErr);
            }
            resolve(cachedData);
          })
          .catch((err) => {
            console.error("Error al cargar emoji-mart asíncronamente:", err);
            initPromise = null;
            resolve(null);
          });
      };

      if (immediate) {
        execute();
      } else if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => execute(), { timeout: 3500 });
      } else {
        setTimeout(execute, 1500);
      }
    });
  }

  return initPromise;
};
