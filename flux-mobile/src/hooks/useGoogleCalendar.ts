import { useEffect, useMemo, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import { Platform } from "react-native";

import {
  createGoogleCalendarEvent,
  fetchGoogleProfile,
  googleCalendarScopes,
  listGoogleCalendarEventsForDate,
} from "../services/googleCalendar";
import { TimelineEvent } from "../types";

const googleConfig = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export function useGoogleCalendar() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");

  const platformClientId = useMemo(
    () =>
      Platform.select({
        android: googleConfig.androidClientId,
        ios: googleConfig.iosClientId,
        default: googleConfig.webClientId,
      }) ?? null,
    [],
  );
  const isConfigured = Boolean(platformClientId);

  const [request, response, promptAsync] = Google.useAuthRequest({
    ...googleConfig,
    clientId: platformClientId ?? "flux-google-oauth-placeholder",
    scopes: googleCalendarScopes,
  });

  useEffect(() => {
    async function hydrateSession() {
      if (response?.type !== "success") {
        return;
      }

      const token = response.authentication?.accessToken ?? null;

      if (!token) {
        setStatus("error");
        return;
      }

      setAccessToken(token);

      try {
        const profile = await fetchGoogleProfile(token);
        setEmail(profile.email ?? null);
        setStatus("connected");
      } catch {
        setStatus("error");
      }
    }

    hydrateSession();
  }, [response]);

  const connect = async () => {
    if (!request || !isConfigured) {
      return;
    }

    setStatus("connecting");
    await promptAsync();
  };

  const disconnect = () => {
    setAccessToken(null);
    setEmail(null);
    setStatus("idle");
  };

  const importDate = async (date: string) => {
    if (!accessToken) {
      throw new Error("Google Calendar is not connected.");
    }

    return listGoogleCalendarEventsForDate(accessToken, date);
  };

  const exportDate = async (date: string, timeline: TimelineEvent[]) => {
    if (!accessToken) {
      throw new Error("Google Calendar is not connected.");
    }

    return Promise.all(timeline.map((event) => createGoogleCalendarEvent(accessToken, date, event)));
  };

  return {
    connect,
    disconnect,
    email,
    exportDate,
    importDate,
    isConfigured,
    isConnected: Boolean(accessToken),
    status,
  };
}
