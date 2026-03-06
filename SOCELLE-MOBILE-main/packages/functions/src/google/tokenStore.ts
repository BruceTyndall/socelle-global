import { getDb } from "../lib/firebase.js";

export interface StoredGoogleToken {
  ciphertext: string;
  keyId: string | null;
}

export interface TokenStore {
  saveGoogleRefreshToken(
    userId: string,
    ciphertext: string,
    keyId: string | null,
    rotatedAtIso: string
  ): Promise<void>;
  loadGoogleRefreshToken(userId: string): Promise<StoredGoogleToken | null>;
  revokeGoogleToken(userId: string, revokedAtIso: string): Promise<void>;
}

export class FirestoreTokenStore implements TokenStore {
  async saveGoogleRefreshToken(
    userId: string,
    ciphertext: string,
    keyId: string | null,
    rotatedAtIso: string
  ): Promise<void> {
    const db = getDb();
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          settings: {
            googleRefreshTokenCiphertext: ciphertext,
            googleRefreshTokenKid: keyId,
            googleTokenRotatedAt: rotatedAtIso,
            googleTokenRevokedAt: null
          }
        },
        { merge: true }
      );
  }

  async loadGoogleRefreshToken(userId: string): Promise<StoredGoogleToken | null> {
    const db = getDb();
    const snapshot = await db.collection("users").doc(userId).get();
    const settings = snapshot.data()?.settings;
    const ciphertext = settings?.googleRefreshTokenCiphertext;

    if (typeof ciphertext !== "string" || !ciphertext) {
      return null;
    }

    return {
      ciphertext,
      keyId: typeof settings?.googleRefreshTokenKid === "string"
        ? settings.googleRefreshTokenKid
        : null
    };
  }

  async revokeGoogleToken(userId: string, revokedAtIso: string): Promise<void> {
    const db = getDb();
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          settings: {
            googleRefreshTokenCiphertext: null,
            googleRefreshTokenKid: null,
            googleTokenRevokedAt: revokedAtIso
          }
        },
        { merge: true }
      );
  }
}
