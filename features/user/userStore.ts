import { getUser } from "./userRepository";
import type { UserProfile } from "./types";

let cachedUser: UserProfile | null | undefined = undefined;
const listeners = new Set<() => void>();

export function readCachedUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  if (cachedUser === undefined) {
    cachedUser = getUser();
  }
  return cachedUser;
}

export function refreshUserCache() {
  cachedUser = typeof window !== "undefined" ? getUser() : null;
  for (const l of listeners) l();
}

export function subscribeUser(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getServerUserSnapshot(): null {
  return null;
}
