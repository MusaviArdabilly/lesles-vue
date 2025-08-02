import { Axis3D } from 'lucide-vue-next';

/**
 * Format a datetime string like "2025-07-20 20:12:54"
 * to "20 Jul 2025 - 20:12:54"
 * @param datetimeStr - A string in "YYYY-MM-DD HH:mm:ss" format
 * @returns A formatted string like "20 Jul 2025 - 20:12:54"
 */
export function formatDateTime(datetimeStr: string): string {
  const date = new Date(datetimeStr.replace(' ', 'T'));

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: "${datetimeStr}"`);
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toTimeString().slice(0, 8); // HH:mm:ss

  return `${day} ${month} ${year} - ${time}`;
}
