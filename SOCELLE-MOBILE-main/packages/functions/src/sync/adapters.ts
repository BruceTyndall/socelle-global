import type { CalendarEvent } from "../../../gap_engine/src/index.js";
import { GoogleCalendarApi, GoogleInvalidGrantError } from "../google/googleApi.js";
import { decryptRefreshToken } from "../google/tokenCrypto.js";
import { FirestoreTokenStore, type TokenStore } from "../google/tokenStore.js";

export interface AdapterFetchInput {
  userId: string;
  start: Date;
  end: Date;
  /// Pre-parsed device events supplied by the mobile app for Apple Calendar.
  /// Only populated when calendarSource is "apple".
  deviceEvents?: CalendarEvent[];
}

export interface CalendarSyncAdapter {
  fetchEvents(input: AdapterFetchInput): Promise<CalendarEvent[]>;
}

export class GoogleCalendarAdapter implements CalendarSyncAdapter {
  constructor(
    private readonly tokenStore: TokenStore = new FirestoreTokenStore(),
    private readonly googleApi: GoogleCalendarApi = new GoogleCalendarApi()
  ) {}

  async fetchEvents(_input: AdapterFetchInput): Promise<CalendarEvent[]> {
    const token = await this.tokenStore.loadGoogleRefreshToken(_input.userId);
    if (!token) {
      throw new Error("Google refresh token not found; reconnect calendar");
    }

    const refreshToken = decryptRefreshToken(token.ciphertext);

    try {
      const accessToken = await this.googleApi.refreshAccessToken(refreshToken);
      return await this.googleApi.listEvents(
        accessToken,
        _input.start.toISOString(),
        _input.end.toISOString()
      );
    } catch (error) {
      if (error instanceof GoogleInvalidGrantError) {
        await this.tokenStore.revokeGoogleToken(
          _input.userId,
          new Date().toISOString()
        );
      }
      throw error;
    }
  }
}

export class AppleCalendarAdapter implements CalendarSyncAdapter {
  async fetchEvents(input: AdapterFetchInput): Promise<CalendarEvent[]> {
    // Device events uploaded by the Flutter app via the syncCalendarEvents payload.
    // The mobile AppleCalendarService reads EventKit events locally and includes
    // them as ISO strings under `deviceEvents` in the request.
    return (input.deviceEvents ?? []).map((e) => ({
      start: e.start,
      end: e.end,
      ...(e.allDay !== undefined ? { allDay: e.allDay } : {})
    }));
  }
}

export function getAdapter(source: "google" | "apple"): CalendarSyncAdapter {
  return source === "google" ? new GoogleCalendarAdapter() : new AppleCalendarAdapter();
}
