export type Difficulty = "easy" | "medium" | "hard";

export type ShelterVariant = "busStop" | "awning" | "phoneBooth";

export type ItemType = "heart" | "raincoat" | "umbrella" | "boots";

export type LightningSchedule = null | {
  gap: { min: number; max: number };
  warnSec?: number;
};

export type Shelter = {
  x: number;
  variant: ShelterVariant;
};

export type Puddle = {
  x: number;
  width: number;
};

export type Item = {
  x: number;
  y: number;
  type: ItemType;
};

export type Stage = {
  id: string;
  bundleId: string;
  name: string;
  difficulty: Difficulty;
  goalDistance: number;
  shelters: Shelter[];
  puddles: Puddle[];
  items: Item[];
  rainRate: number;
  lightning: LightningSchedule;
};

export type BundleStatus = "available" | "coming-soon";

export type Theme = {
  backgroundImage: string;
  shelterSprites: Record<ShelterVariant, string>;
  puddleSprite: string;
  itemSprites: Record<ItemType, string>;
  bgm: string;
};

export type Bundle = {
  id: string;
  name: string;
  stageIds: string[];
  status: BundleStatus;
  theme?: Theme;
};

export type StageProgress = {
  clearedStageIds: string[];
  bestScores: { [stageId: string]: number };
  attemptCounts: { [stageId: string]: number };
};
