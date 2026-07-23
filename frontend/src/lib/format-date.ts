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
  
  // Hardcoded offset: +3 hours (Egypt Summer Time)
  const offsetMs = 3 * 60 * 60 * 1000;
  
  // Create a new Date object shifted forward by the offset
  const localD = new Date(d.getTime() + offsetMs);
  
  return format(localD, formatStr);
}
