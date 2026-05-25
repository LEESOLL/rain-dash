import { setData, getData } from "@/lib/storage";
import { generateId } from "@/lib/id";
import type { UserProfile } from "./types";

const KEY = "rd:user";

/** 닉네임 최대 글자 수 (랭킹 표시 길이 고려) */
export const MAX_NICKNAME_LENGTH = 12;

export function generateDefaultNickname(): string {
  const num = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `Dasher_${num}`;
}

export function getUser(): UserProfile | null {
  return getData<UserProfile | null>(KEY, null);
}

export function createUser(nickname?: string): UserProfile {
  const existing = getUser();
  if (existing) return existing;

  const cleaned = nickname?.trim().slice(0, MAX_NICKNAME_LENGTH);
  const profile: UserProfile = {
    userId: generateId(),
    nickname:
      cleaned && cleaned.length > 0 ? cleaned : generateDefaultNickname(),
    createdAt: Date.now(),
  };
  setData(KEY, profile);
  return profile;
}
