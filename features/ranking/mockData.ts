import type { MockUser } from "./types";

/** 랭킹 데모용 가상 유저들. 향후 서버 연동 시 교체될 임시 데이터. */
export const MOCK_USERS: MockUser[] = [
  {
    nickname: "RainKing",
    cumulativeScore: 487_200,
    bundleScores: {
      "rainy-day": 124_500,
      "rainy-night": 98_700,
      "snowy-day": 76_300,
      "snowy-night": 65_400,
      "future-city": 89_200,
      "space-station": 33_100,
    },
  },
  {
    nickname: "SpeedDemon_77",
    cumulativeScore: 423_500,
    bundleScores: {
      "rainy-day": 142_800,
      "rainy-night": 108_200,
      "snowy-day": 95_400,
      "future-city": 77_100,
    },
  },
  {
    nickname: "GaleForce",
    cumulativeScore: 398_100,
    bundleScores: {
      "rainy-day": 89_400,
      "rainy-night": 76_200,
      "snowy-day": 84_300,
      "snowy-night": 72_500,
      "future-city": 45_600,
      "space-station": 30_100,
    },
  },
  {
    nickname: "StormChaser",
    cumulativeScore: 312_900,
    bundleScores: {
      "rainy-day": 104_600,
      "rainy-night": 87_300,
      "snowy-night": 58_200,
      "future-city": 62_800,
    },
  },
  {
    nickname: "Dasher_2841",
    cumulativeScore: 234_500,
    bundleScores: {
      "rainy-day": 78_900,
      "rainy-night": 56_300,
      "snowy-day": 43_200,
    },
  },
  {
    nickname: "PuddleHopper",
    cumulativeScore: 187_200,
    bundleScores: {
      "rainy-day": 95_400,
      "rainy-night": 67_800,
    },
  },
  {
    nickname: "BoltDodger",
    cumulativeScore: 156_800,
    bundleScores: {
      "rainy-night": 89_200,
      "snowy-night": 54_200,
    },
  },
  {
    nickname: "MistyRunner",
    cumulativeScore: 124_300,
    bundleScores: {
      "rainy-day": 56_400,
      "rainy-night": 34_200,
      "snowy-day": 28_700,
    },
  },
  {
    nickname: "Dasher_5103",
    cumulativeScore: 67_400,
    bundleScores: {
      "rainy-day": 34_200,
      "rainy-night": 22_100,
    },
  },
  {
    nickname: "CloudWalker",
    cumulativeScore: 41_200,
    bundleScores: {
      "rainy-day": 28_700,
      "snowy-day": 12_500,
    },
  },
  {
    nickname: "Dasher_0492",
    cumulativeScore: 18_700,
    bundleScores: {
      "rainy-day": 18_700,
    },
  },
];
