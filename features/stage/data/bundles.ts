import type { Bundle } from "../types";

export const BUNDLES: Bundle[] = [
  {
    id: "rainy-day",
    name: "비 오는 낮 거리",
    stageIds: ["rainy-day-01"],
    status: "available",
    theme: {
      backgroundImage: "/sprites/rainy-day/bg.png",
      shelterSprites: {
        busStop: "/sprites/rainy-day/bus-stop.png",
        awning: "/sprites/rainy-day/awning.png",
        phoneBooth: "/sprites/rainy-day/phone-booth.png",
      },
      puddleSprite: "/sprites/rainy-day/puddle.png",
      itemSprites: {
        heart: "/sprites/items/heart.png",
        raincoat: "/sprites/items/raincoat.png",
        umbrella: "/sprites/items/umbrella.png",
        boots: "/sprites/items/boots.png",
      },
      bgm: "/audio/rainy-day.mp3",
    },
  },
  {
    id: "rainy-night",
    name: "비 오는 밤 거리",
    stageIds: [],
    status: "coming-soon",
  },
  {
    id: "snowy-day",
    name: "눈 오는 낮 거리",
    stageIds: [],
    status: "coming-soon",
  },
  {
    id: "snowy-night",
    name: "눈 오는 밤 거리",
    stageIds: [],
    status: "coming-soon",
  },
  { id: "future-city", name: "미래 도시", stageIds: [], status: "coming-soon" },
  {
    id: "space-station",
    name: "우주 정거장",
    stageIds: [],
    status: "coming-soon",
  },
];
