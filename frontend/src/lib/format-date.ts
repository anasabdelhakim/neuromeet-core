import { format } from "date-fns";

/**
 * A central utility to consistently format dates across the entire application.
 * Since Vercel forces UTC timezone on the server and blocks TZ overrides,
 * this function automatically adds +3 hours to simulate Egypt time before formatting.
 * 
 * @param date - The Date object or ISO string to format
 * @param formatStr - The date-fns format string
 * @returns The formatted date string in Egypt time
 */
export function formatEgyptTime(date: Date | string | number, formatStr: string): string {
  const d = new Date(date);
  
  // Vercel server is UTC (offset 0). Your laptop in Egypt has an offset of -180 (UTC+3).
  const isServerUTC = d.getTimezoneOffset() === 0;

  // If we are on your local laptop (Dev Mode), DO NOT add the 3 hours.
  if (!isServerUTC) {
    return format(d, formatStr);
  }

  // If we are on Vercel (Production Mode), manually add the +3 hours offset.
  const offsetMs = 3 * 60 * 60 * 1000;
  const localD = new Date(d.getTime() + offsetMs);
  
  return format(localD, formatStr);
}
