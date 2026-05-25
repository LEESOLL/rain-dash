import type { Bundle } from "../types";

export const BUNDLES: Bundle[] = [
  {
    id: "rainy_street",
    name: "비 오는 거리",
    stageIds: [
      "rainy_street-01",
      "rainy_street-02",
      "rainy_street-03",
      "rainy_street-04",
    ],
    status: "available",
  },
  {
    id: "snow_street",
    name: "눈 오는 거리",
    stageIds: [
      "snow_street-01",
      "snow_street-02",
      "snow_street-03",
      "snow_street-04",
      "snow_street-05",
    ],
    status: "coming-soon",
  },
  {
    id: "space",
    name: "운석 떨어지는 우주",
    stageIds: ["space-01", "space-02", "space-03"],
    status: "coming-soon",
  },
];
