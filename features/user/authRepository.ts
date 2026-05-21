import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

let authReady: Promise<string> | null = null;

/** 익명 로그인 보장 — 이미 로그인돼 있으면 그 uid, 아니면 익명 로그인 후 uid 반환 */
export function ensureAuth(): Promise<string> {
  if (authReady) return authReady;
  authReady = new Promise<string>((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      unsub();
      if (user) {
        resolve(user.uid);
        return;
      }
      signInAnonymously(auth)
        .then((cred) => resolve(cred.user.uid))
        .catch(reject);
    });
  });
  return authReady;
}

export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
