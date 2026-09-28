const colorCache = new Map<string, string>();

let reusableCanvas: HTMLCanvasElement | null = null;
let reusableCtx: CanvasRenderingContext2D | null = null;

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function getEmojiDominantColor(
  emoji: string,
  defaultFallback = "#0693E3",
): string {
  if (!emoji || typeof emoji !== "string") return defaultFallback;

  const cached = colorCache.get(emoji);
  if (cached) return cached;

  if (typeof window === "undefined" || typeof document === "undefined") {
    return defaultFallback;
  }

  try {
    if (!reusableCanvas) {
      reusableCanvas = document.createElement("canvas");
      reusableCanvas.width = 32;
      reusableCanvas.height = 32;
      reusableCtx = reusableCanvas.getContext("2d", {
        willReadFrequently: true,
      });
    }

    if (!reusableCtx) return defaultFallback;

    reusableCtx.clearRect(0, 0, 32, 32);
    reusableCtx.font =
      "24px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', sans-serif";
    reusableCtx.textAlign = "center";
    reusableCtx.textBaseline = "middle";
    reusableCtx.fillText(emoji, 16, 16);

    const imgData = reusableCtx.getImageData(0, 0, 32, 32).data;

    let bestColor = "";
    let highestScore = -1;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let count = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      const a = imgData[i + 3];
      if (a < 120) continue;

      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;

      const isNearWhite = r > 235 && g > 235 && b > 235;
      const isNearBlack = r < 25 && g < 25 && b < 25;

      if (!isNearWhite && !isNearBlack) {
        sumR += r;
        sumG += g;
        sumB += b;
        count++;
      }

      const score = chroma * (a / 255);
      if (score > highestScore) {
        highestScore = score;
        bestColor = rgbToHex(r, g, b);
      }
    }

    let finalColor = bestColor;

    if (!finalColor || highestScore < 15) {
      if (count > 0) {
        finalColor = rgbToHex(
          Math.round(sumR / count),
          Math.round(sumG / count),
          Math.round(sumB / count),
        );
      } else {
        finalColor = defaultFallback;
      }
    }

    colorCache.set(emoji, finalColor);
    return finalColor;
  } catch (err) {
    console.error("Error al extraer color del emoji:", err);
    return defaultFallback;
  }
}
