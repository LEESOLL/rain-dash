import { getUser } from "./userRepository";
import type { UserProfile } from "./types";

let cachedUser: UserProfile | null | undefined = undefined;

export function readCachedUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  if (cachedUser === undefined) {
    cachedUser = getUser();
  }
  return cachedUser;
}

export function refreshUserCache() {
  cachedUser = typeof window !== "undefined" ? getUser() : null;
}
