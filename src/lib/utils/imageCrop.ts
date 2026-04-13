export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

export const MAX_AVATAR_RES = 128;
export const MAX_AVATAR_FILE_SIZE = 100 * 1024;

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  flip = { horizontal: false, vertical: false },
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const targetSize = Math.min(pixelCrop.width, MAX_AVATAR_RES);

  canvas.width = targetSize;
  canvas.height = targetSize;

  ctx.translate(targetSize / 2, targetSize / 2);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-targetSize / 2, -targetSize / 2);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize,
  );

  return new Promise((resolve) => {
    let quality = 0.8;

    const tryCompress = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(null);

          if (blob.size <= MAX_AVATAR_FILE_SIZE || quality <= 0.4) {
            resolve(blob);
          } else {
            quality -= 0.1;
            tryCompress();
          }
        },
        "image/webp",
        quality,
      );
    };

    tryCompress();
  });
}
