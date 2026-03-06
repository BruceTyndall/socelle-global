import type { CalendarEvent } from "../../../gap_engine/src/index.js";

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleEventsResponse {
  items?: Array<{
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
  }>;
}

export class GoogleInvalidGrantError extends Error {
  constructor() {
    super("Google refresh token is invalid or revoked");
  }
}

export class GoogleCalendarApi {
  /// Exchanges a one-time server auth code (from Google Sign-In on mobile)
  /// for a long-lived refresh token. The auth code is single-use and expires
  /// after a few minutes — call this immediately after receiving it.
  async exchangeAuthCode(serverAuthCode: string): Promise<string> {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are required");
    }

    const body = new URLSearchParams({
      code: serverAuthCode,
      client_id: clientId,
      client_secret: clientSecret,
      // redirect_uri must be empty string for mobile server auth code exchange
      redirect_uri: "",
      grant_type: "authorization_code"
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });

    const payload = (await response.json()) as GoogleTokenResponse;

    if (!response.ok) {
      if (payload.error === "invalid_grant") {
        throw new GoogleInvalidGrantError();
      }
      throw new Error(payload.error_description ?? "Unable to exchange Google auth code");
    }

    if (!payload.refresh_token) {
      throw new Error(
        "Google token response missing refresh_token — ensure the app has not already exchanged this code"
      );
    }

    return payload.refresh_token;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are required");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body
    });

    const payload = (await response.json()) as GoogleTokenResponse;

    if (!response.ok) {
      if (payload.error === "invalid_grant") {
        throw new GoogleInvalidGrantError();
      }
      throw new Error(payload.error_description ?? "Unable to refresh Google access token");
    }

    if (!payload.access_token) {
      throw new Error("Google token response missing access_token");
    }

    return payload.access_token;
  }

  async listEvents(
    accessToken: string,
    startIso: string,
    endIso: string
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      calendarId: "primary",
      timeMin: startIso,
      timeMax: endIso,
      singleEvents: "true",
      orderBy: "startTime"
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google Calendar events request failed: ${response.status}`);
    }

    const payload = (await response.json()) as GoogleEventsResponse;
    const items = payload.items ?? [];
    const events: CalendarEvent[] = [];

    for (const item of items) {
      const startRaw = item.start?.dateTime ?? item.start?.date;
      const endRaw = item.end?.dateTime ?? item.end?.date;
      if (!startRaw || !endRaw) {
        continue;
      }

      const start = new Date(startRaw);
      const end = new Date(endRaw);
      if (!(start < end)) {
        continue;
      }

      const event: CalendarEvent = { start, end };
      if (!item.start?.dateTime) {
        event.allDay = true;
      }

      events.push(event);
    }

    return events;
  }
}
