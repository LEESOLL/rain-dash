export type RankEntry = {
  nickname: string;
  score: number;
  isMe: boolean;
};

export type MockUser = {
  nickname: string;
  cumulativeScore: number;
  bundleScores: Record<string, number>;
};
