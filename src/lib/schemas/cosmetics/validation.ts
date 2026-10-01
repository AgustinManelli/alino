import { z } from "zod";

const cosmeticAssetTypeSchema = z.enum([
  "image",
  "svg",
  "video",
  "webp",
  "apng",
  "gif",
]);

const cosmeticAssetSourceSchema = z
  .object({
    src: z.string().min(1).max(2048),
    type: cosmeticAssetTypeSchema.optional(),
    width: z.number().int().positive().max(8192).optional(),
    height: z.number().int().positive().max(8192).optional(),
    alt: z.string().max(160).optional(),
    version: z
      .string()
      .regex(/^[a-zA-Z0-9._-]{1,80}$/)
      .optional(),
    integrity: z
      .string()
      .regex(/^sha256-[A-Za-z0-9+/=]{20,}$/)
      .optional(),
  })
  .strict();

const requireVersionedAssetMetadata = (
  asset: { src: string; version?: string; integrity?: string },
  context: z.RefinementCtx,
) => {
  if (!asset.version || !asset.integrity) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["version"],
      message:
        "Version and SHA-256 integrity are required for published assets.",
    });
  }
};

const validatedCosmeticAssetSourceSchema =
  cosmeticAssetSourceSchema.superRefine(requireVersionedAssetMetadata);

const cosmeticAssetSchema = z
  .object({
    src: z.string().min(1).max(2048),
    type: cosmeticAssetTypeSchema.optional(),
    width: z.number().int().positive().max(8192).optional(),
    height: z.number().int().positive().max(8192).optional(),
    alt: z.string().max(160).optional(),
    version: z
      .string()
      .regex(/^[a-zA-Z0-9._-]{1,80}$/)
      .optional(),
    integrity: z
      .string()
      .regex(/^sha256-[A-Za-z0-9+/=]{20,}$/)
      .optional(),
    variants: z
      .object({
        animated: z.array(validatedCosmeticAssetSourceSchema).max(4).optional(),
        static: validatedCosmeticAssetSourceSchema.optional(),
        reduced_motion: validatedCosmeticAssetSourceSchema.optional(),
      })
      .strict()
      .optional(),
    loop: z.boolean().optional(),
    duration_ms: z.number().int().positive().max(120_000).optional(),
    loading: z.enum(["eager", "lazy"]).optional(),
  })
  .strict()
  .superRefine(requireVersionedAssetMetadata);

const cosmeticTransformSchema = z
  .object({
    x: z.string().max(32).optional(),
    y: z.string().max(32).optional(),
    scale: z.number().positive().max(4).optional(),
    rotate: z.number().finite().min(-360).max(360).optional(),
  })
  .strict();

export const cosmeticVisualManifestSchema = z
  .object({
    layers: z
      .array(
        z
          .object({
            asset_key: z.string().min(1).max(80),
            z_index: z.number().int().min(-100).max(100).optional(),
            opacity: z.number().min(0).max(1).optional(),
            transform: cosmeticTransformSchema.optional(),
          })
          .strict(),
      )
      .max(12)
      .optional(),
    motion: z
      .object({
        reduced_motion_asset: z.string().min(1).max(80).optional(),
      })
      .strict()
      .optional(),
    responsive: z
      .object({
        min_size: z.number().positive().max(8192).optional(),
        max_size: z.number().positive().max(8192).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const cosmeticAssetManifestSchema = z
  .record(cosmeticAssetSchema)
  .refine((assets) => Object.keys(assets).length <= 24, {
    message: "A cosmetic cannot contain more than 24 assets.",
  });

export const cosmeticMediaManifestSchema = z
  .object({
    visual: cosmeticVisualManifestSchema,
    assets: cosmeticAssetManifestSchema,
  })
  .strict()
  .superRefine((manifest, context) => {
    const layers = manifest.visual.layers ?? [];
    const assetKeys = new Set(Object.keys(manifest.assets));

    layers.forEach((layer, index) => {
      if (!assetKeys.has(layer.asset_key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["visual", "layers", index, "asset_key"],
          message: `Unknown asset key "${layer.asset_key}".`,
        });
      }
    });

    const reducedMotionKey = manifest.visual.motion?.reduced_motion_asset;
    if (reducedMotionKey && !assetKeys.has(reducedMotionKey)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visual", "motion", "reduced_motion_asset"],
        message: `Unknown reduced-motion asset key "${reducedMotionKey}".`,
      });
    }

    const { min_size: minSize, max_size: maxSize } =
      manifest.visual.responsive ?? {};
    if (minSize !== undefined && maxSize !== undefined && minSize > maxSize) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visual", "responsive"],
        message: "min_size cannot be greater than max_size.",
      });
    }
  });

export type CosmeticMediaManifest = z.infer<typeof cosmeticMediaManifestSchema>;

export const parseCosmeticMediaManifest = (
  value: unknown,
): CosmeticMediaManifest => cosmeticMediaManifestSchema.parse(value);

export const isCosmeticMediaManifest = (
  value: unknown,
): value is CosmeticMediaManifest =>
  cosmeticMediaManifestSchema.safeParse(value).success;
