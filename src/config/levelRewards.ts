export interface LevelRewardDefinition {
  level: number;
  cosmeticId: string;
  name: string;
  type: "frame" | "overlay";
  description: string;
}

export const LEVEL_REWARDS: LevelRewardDefinition[] = [
  {
    level: 2,
    cosmeticId: "frame_bronze",
    name: "Borde Bronce",
    type: "frame",
    description: "Marco metálico con brillo bronce forjado para iniciados.",
  },
  {
    level: 4,
    cosmeticId: "frame_silver",
    name: "Borde Plateado",
    type: "frame",
    description: "Marco plateado reflectante para usuarios perseverantes.",
  },
  {
    level: 6,
    cosmeticId: "frame_emerald",
    name: "Borde Esmeralda",
    type: "frame",
    description: "Marco con gemas esmeralda pulsantes y resplandor verde.",
  },
  {
    level: 10,
    cosmeticId: "frame_celestial",
    name: "Borde Mítico Cósmico",
    type: "frame",
    description: "Marco supremo con gradiente estelar cósmico animado.",
  },
];

export const getNextLevelReward = (currentLevel: number): LevelRewardDefinition | null => {
  return LEVEL_REWARDS.find((r) => r.level > currentLevel) ?? null;
};
