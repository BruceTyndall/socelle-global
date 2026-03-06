import { initializeApp, getApps, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Eager init: ensures Firebase Admin is initialized at import time.
// This makes it safe for any module to call getFirestore() at top level,
// as long as lib/firebase.ts is imported (directly or transitively) first.
const adminApp: App = getApps().length === 0 ? initializeApp() : getApps()[0];

export function getDb() {
  return getFirestore(adminApp);
}
