import { setData, getData } from "@/lib/storage";
import { generateId } from "@/lib/id";
import type { UserProfile } from "./types";

const KEY = "rd:user";

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

  const cleaned = nickname?.trim();
  const profile: UserProfile = {
    userId: generateId(),
    nickname: cleaned && cleaned.length > 0 ? cleaned : generateDefaultNickname(),
    createdAt: Date.now(),
  };
  setData(KEY, profile);
  return profile;
}

export function changeNickname(nickname: string): UserProfile {
  const trimmed = nickname.trim();
  const existing = getUser();
  if (!existing) return createUser(trimmed);
  const updated = { ...existing, nickname: trimmed };
  setData(KEY, updated);
  return updated;
}
