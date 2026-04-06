const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
const fallbackApiUrl = "http://oncallcare.nafvalleyradio.org/api";

if (!rawApiUrl) {
  console.warn(
    "[CONFIG] EXPO_PUBLIC_API_URL is missing. Set it in mobile/.env and restart Expo with -c.",
  );
}

export const API_URL = (rawApiUrl || fallbackApiUrl).replace(/\/$/, "");
